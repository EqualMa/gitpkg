import * as pako from "pako";

class PakoStream<S extends pako.Deflate | pako.Inflate> extends TransformStream<
  ArrayBuffer | ArrayBufferView,
  ArrayBuffer
> {
  constructor(compressor: S) {
    let endCb: (() => void) | undefined;
    super(
      {
        start: controller => {
          compressor.onData = dat => {
            controller.enqueue(dat);
          };

          compressor.onEnd = status => {
            if (status === (pako.constants.Z_OK as number)) {
              if (endCb) endCb();
              else controller.terminate();
            } else {
              controller.error(
                new Error(`Compression ended with error status ${status}`),
              );
            }
          };
        },
        transform: chunk => {
          let out: Uint8Array;
          if (chunk instanceof ArrayBuffer) out = new Uint8Array(chunk);
          else if (ArrayBuffer.isView(chunk)) {
            out = new Uint8Array(
              chunk.buffer,
              chunk.byteOffset,
              chunk.byteLength,
            );
          } else {
            throw new TypeError(
              "The provided value is not of type '(ArrayBuffer or ArrayBufferView)'",
            );
          }
          compressor.push(out);
        },
        flush: () =>
          new Promise(resolve => {
            endCb = resolve;
            compressor.push(new Uint8Array(0), true);
          }),
      },
      {
        // See https://stackoverflow.com/a/7488075 for pros and cons of `| 0`
        size: chunk => chunk.byteLength | 0,
        highWaterMark: 65536,
      },
    );
  }
}

export class CompressionStream extends PakoStream<pako.Deflate> {
  constructor(format: string) {
    if (format !== "gzip")
      throw new Error(`Compression format ${format} not implemented`);

    super(new pako.Deflate({ gzip: true }));
  }
}

export class DecompressionStream extends PakoStream<pako.Inflate> {
  constructor(format: string) {
    if (format !== "gzip")
      throw new Error(`Decompression format ${format} not implemented`);

    super(new pako.Inflate());
  }
}
