import { extract, TarEntryWithStream } from "../src";
import * as tar from "tar-stream";
import gunzip from "../src/util/gunzip-maybe";
import { randomTar } from "./util/random-tar";
import { iterablesAreSameSet } from "./util/compare-iterable";
import { PassThrough } from "stream";
import { drain } from "../src/util/drain";
import { Locker } from "./util/lock";
import "./matcher/tar-entry";

import { repeatAsync as _repeatAsync } from "./util/repeat";
const repeatAsync = _repeatAsync.bind(undefined, 1);

test("extract tar and tgz", () =>
  repeatAsync(() =>
    Promise.all(
      ([
        [true, true],
        [false, false],
        [true, "auto"],
        [false, "auto"],
        [true, undefined],
        [false, undefined],
      ] as const).map(async ([packGzip, extractGzipOption]) => {
        const stdX = tar.extract();
        const x = extract({ gzip: extractGzipOption });

        {
          const [r1, r2] = randomTar(packGzip, 2);

          const gz = gunzip();
          r1.pipe(gz).pipe(stdX);
          r2.pipe(x);
        }

        const stdResIter = new PassThrough({ objectMode: true });
        const stdResIterWriteLock = new Locker();

        await Promise.all([
          new Promise((resolve, reject) => {
            stdX
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              .on("entry", async (headers, stream, next) => {
                const entry: TarEntryWithStream = { headers, stream };

                const unlock = await stdResIterWriteLock.lock();

                let rsv: () => void;
                let rjt: (err: Error) => void;
                const promises: Promise<unknown>[] = [
                  new Promise((r, j) => {
                    rsv = r;
                    rjt = j;
                  }),
                ];

                if (
                  !stdResIter.write(entry, err => {
                    if (err) rjt(err);
                    else rsv();
                  })
                ) {
                  promises.push(drain(stdResIter));
                }

                await Promise.all(promises);

                unlock();

                next();
              })
              .on("error", err => {
                reject(err);
              })
              .on("finish", () => {
                stdResIterWriteLock.lock().then(unlock => {
                  stdResIter.end(() => {
                    unlock();
                    resolve();
                  });
                });
              });
          }),
          expect(
            iterablesAreSameSet({
              iterables: [x, stdResIter],
              async compare(a, b) {
                try {
                  await expect(a).toBeTarEntry(b);
                  return true;
                } catch {
                  return false;
                }
              },
            }),
          ).resolves.toBe(true),
        ]);
      }),
    ),
  ));
