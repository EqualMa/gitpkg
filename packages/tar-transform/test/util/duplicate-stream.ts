import { PassThrough, Readable } from "stream";
import { drain } from "../../src/util/drain";

export function duplicateReadable(
  r: Readable,
  count = 2,
  options?: import("stream").TransformOptions,
): Readable[] {
  if (count < 2) {
    throw new Error("duplicate count must be at least 2");
  }

  const ps = new Array<{ pass: PassThrough; done: Promise<void> }>(count);

  for (let i = 0; i < count; i++) {
    ps[i] = { pass: new PassThrough(options), done: Promise.resolve() };
  }

  (async () => {
    for await (const chunk of r) {
      await Promise.all(
        ps.map(async p => {
          let resolve: () => void;
          let reject: (err: Error) => void;
          const promise = new Promise((rsv, rjt) => {
            resolve = rsv;
            reject = rjt;
          });
          if (
            !p.pass.write(chunk, err => {
              if (err) reject(err);
              else resolve();
            })
          ) {
            await drain(p.pass);
          }

          await promise;
        }),
      );
    }

    // for (const p of ps) {
    //   new Promise((resolve, reject) => {
    //     p.pass.end(() => {
    //       resolve();
    //     });
    //   });
    // }

    await Promise.all(
      ps.map(
        p =>
          new Promise(resolve => {
            p.pass.end(() => {
              resolve();
            });
          }),
      ),
    );
  })();

  return ps.map(p => p.pass);
}
