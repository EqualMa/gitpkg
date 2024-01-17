/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Buffer } from "buffer";

/**
 * Untested simple implementation.
 */
export function readableToWeb(
  sx: import("stream").Readable,
  { type }: { type?: ReadableStreamType } = {},
): ReadableStream {
  const source = sx[Symbol.asyncIterator]();

  return new ReadableStream({
    async pull(controller) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { value, done } = await source.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    cancel(reason) {
      sx.destroy(reason);
    },
    type,
  });
}

/**
 * Untested simple implementation.
 */
export function writableToWeb(sx: import("stream").Writable): WritableStream {
  return new WritableStream({
    write(chunk) {
      chunk = Buffer.from(chunk);
      return new Promise<void>((resolve, reject) => {
        if (
          !sx.write(chunk, error => {
            if (error) {
              reject(error);
              sx.destroy(error); // TODO: ?
            }
          })
        ) {
          sx.once("drain", resolve);
        } else {
          // process.nextTick(resolve)
          void Promise.resolve().then(resolve);
        }
      });
    },
    close() {
      return new Promise(resolve => sx.end(resolve));
    },
    abort(err) {
      sx.destroy(err);
    },
  });
}
