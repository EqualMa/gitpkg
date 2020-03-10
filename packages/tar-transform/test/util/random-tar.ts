import * as tar from "tar-stream";
import * as zlib from "zlib";
import * as rf from "./random-file";
import { Readable } from "stream";
import { duplicateReadable } from "./duplicate-stream";

export const packEntry = (
  pack: tar.Pack,
  headers: tar.Headers,
  content?: string | Buffer,
) =>
  new Promise((resolve, reject) => {
    const cb: tar.Callback = err => {
      if (err) reject(err);
      else resolve();
    };
    if (content !== undefined) pack.entry(headers, content, cb);
    else pack.entry(headers, cb);
  });

export function randomTar(
  gzip: boolean,
  duplicate?: false,
  randomFilesOptions?: rf.RandomFilesOptions,
): Readable;
export function randomTar(
  gzip: boolean,
  duplicate: number,
  randomFilesOptions?: rf.RandomFilesOptions,
): Readable[];
export function randomTar(
  gzip: boolean,
  duplicate?: false | number,
  randomFilesOptions?: rf.RandomFilesOptions,
): Readable | Readable[] {
  const pack = tar.pack();

  let readable: import("stream").Readable = pack;

  if (gzip) {
    const gz = zlib.createGzip();
    pack.pipe(gz);
    readable = gz;
  }

  (async () => {
    for await (const f of rf.iterRandomFiles({
      ...randomFilesOptions,
      onlyFile: "file-and-empty-dir",
    })) {
      const { path, file } = f;

      if (file.type === "file") {
        await packEntry(pack, { name: path }, file.content);
      } else if (file.type === "dir" && file.files.length === 0) {
        await packEntry(pack, { name: path, type: "directory" });
      } else {
        throw new Error("unsupported file type");
      }
    }

    pack.finalize();
  })();

  if (duplicate && typeof duplicate === "number") {
    return duplicateReadable(readable, duplicate);
  } else return readable;
}
