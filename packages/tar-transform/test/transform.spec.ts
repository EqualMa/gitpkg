import { extract, TarEntry, transform } from "../src";
import * as r from "./util/random";
import { randomTar } from "./util/random-tar";
import * as ci from "./util/compare-iterable";
import "./matcher/tar-entry";
import { headersWithNewName } from "../src/util/tar-entry-headers";

import { repeatAsync as _repeatAsync } from "./util/repeat";
const repeatAsync = _repeatAsync.bind(undefined, 10);

test("transform with identity function", () =>
  repeatAsync(async () => {
    const [tar1, tar2] = randomTar(false, 2);
    const e1 = extract({ gzip: false });
    const e2 = extract({ gzip: false });

    const t = transform<never>({
      onEntry(a) {
        this.push(a);
      },
    });

    tar1.pipe(e1).pipe(t);
    tar2.pipe(e2);

    await expect(
      ci.iterablesAreSameSet({
        iterables: [e2, t],
        compare: async (a, b) => {
          try {
            await expect(a).toBeTarEntry(b);
            return true;
          } catch (err) {
            return false;
          }
        },
      }),
    ).resolves.toBe(true);
  }));

test("transform path", () =>
  repeatAsync(async () => {
    const [tar1, tar2] = randomTar(false, 2);
    const e1 = extract({ gzip: false });
    const e2 = extract({ gzip: false });

    const t = transform<never>({
      onEntry(a) {
        this.push({
          ...a,
          headers: this.headersWithNewName(
            a.headers,
            "custom-root/" + a.headers.name,
          ),
        });
      },
    });

    tar1.pipe(e1).pipe(t);
    tar2.pipe(e2);

    await expect(
      ci.iterablesAreSameSet<TarEntry>({
        iterables: [e2, t],
        compare: async (a, b, idx1, idx2) => {
          if (!((idx1 === 0 && idx2 === 1) || (idx1 === 1 && idx2 === 0))) {
            throw new Error("invalid state");
          }

          const [source, target] = idx1 === 0 ? [a, b] : [b, a];

          try {
            await expect(target).toBeTarEntry({
              ...source,
              headers: headersWithNewName(
                source.headers,
                "custom-root/" + source.headers.name,
              ),
            });
            return true;
          } catch {
            return false;
          }
        },
      }),
    ).resolves.toBe(true);
  }));

test("transform content", () =>
  repeatAsync(async () => {
    const content = await r.randomString({ min: 1, max: 10 });
    const [tar1, tar2] = randomTar(false, 2);

    const e1 = extract({ gzip: false });
    const e2 = extract({ gzip: false });

    const t = transform<never>({
      onEntry(a) {
        this.push({
          headers: a.headers,
          content,
        });
      },
    });

    tar1.pipe(e1).pipe(t);
    tar2.pipe(e2);

    await expect(
      ci.iterablesAreSameSet<TarEntry>({
        iterables: [e2, t],
        compare: async (a, b, idx1, idx2) => {
          if (!((idx1 === 0 && idx2 === 1) || (idx1 === 1 && idx2 === 0))) {
            throw new Error("invalid state");
          }

          const [source, target] = idx1 === 0 ? [a, b] : [b, a];

          try {
            await expect(target).toBeTarEntry({
              headers: source.headers,
              content,
            });
            return true;
          } catch {
            return false;
          }
        },
      }),
    ).resolves.toBe(true);
  }));

test("transform with context", () =>
  repeatAsync(async () => {
    const content = await r.randomString({ min: 1, max: 10 });
    const [tar1, tar2] = randomTar(false, 2);

    const e1 = extract({ gzip: false });
    const e2 = extract({ gzip: false });

    let num = -1;
    const t = transform({
      onEntry(a) {
        this.ctx.i++;
        this.push({
          headers: a.headers,
          content,
        });
      },
      onEnd() {
        num = this.ctx.i;
      },
      initCtx: { i: 0 },
    });

    tar1.pipe(e1).pipe(t);
    tar2.pipe(e2);

    const [count1, count2] = await Promise.all([
      new Promise<number>((resolve, reject) => {
        let i = 0;
        t.on("data", () => {
          i++;
        })
          .on("error", reject)
          .on("end", () => resolve(i));
      }),
      (async () => {
        let n = 0;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of e2) {
          n++;
        }
        return n;
      })(),
    ] as const);

    expect(num).toBe(count1);
    expect(num).toBe(count2);
  }));
