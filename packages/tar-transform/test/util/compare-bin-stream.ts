import * as crypto from "crypto";
import { Readable, pipeline as _pipeline } from "stream";
import { promisify } from "util";
const pipeline = promisify(_pipeline);

export async function binaryStreamsAreSame(
  iterables: (AsyncIterable<Int8Array> | Iterable<Int8Array>)[],
) {
  if (iterables.length === 0) return true;

  const readableAndHashes = iterables.map(iter => ({
    readable: Readable.from(iter),
    hash: crypto.createHash("sha1").setEncoding("hex"),
  }));

  await Promise.all(readableAndHashes.map(r => pipeline(r.readable, r.hash)));

  const hashes = readableAndHashes.map(r => r.hash.read());

  return hashes.every(h => h === hashes[0]);
}
