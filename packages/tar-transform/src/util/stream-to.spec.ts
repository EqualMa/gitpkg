import { streamToBuffer, streamToString } from "./stream-to";
import { Readable, listenerCount } from "stream";
import { iterRandomBytesSync } from "../../test/util/random";

function readableEndClean(readable: Readable) {
  expect(listenerCount(readable, "data")).toBe(0);
  expect(listenerCount(readable, "error")).toBe(0);
  expect(listenerCount(readable, "end")).toBe(0);
}

test("stream to buffer", async () => {
  const buffers = [...iterRandomBytesSync(10, { min: 0, max: 400 })];

  const readable = Readable.from(buffers);

  const buffer = await streamToBuffer(readable);

  expect(buffer).toEqual(Buffer.concat(buffers));

  readableEndClean(readable);
});

test("stream to string", async () => {
  const buffers = [...iterRandomBytesSync(10, { min: 0, max: 400 })];
  const str = Buffer.concat(buffers).toString("utf8");

  const readable = Readable.from(buffers);
  const res = await streamToString(readable);

  expect(res).toEqual(str);

  readableEndClean(readable);
});
