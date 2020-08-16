import { extractSubFolder } from "./extract-sub-folder";
import { TarEntry } from "tar-transform";
import { Readable, pipeline as _pipeline } from "stream";
import { tarEntries, getEntries } from "../../test/util/tar-entry";

import { promisify } from "util";
const pipeline = promisify(_pipeline);

test("do not extract sub folder (only extract root folder)", () => {
  const read = Readable.from(tarEntries({ root: "root/" }));
  const t = extractSubFolder("");
  return Promise.all([
    pipeline(read, t),
    expect(getEntries(t)).resolves.toEqual<TarEntry[]>([
      ...tarEntries({ root: "" }),
    ]),
  ]);
});

test("extract sub folder", () => {
  const sub = "dir1/";

  const read = Readable.from(tarEntries({ root: "root/" }));
  const t = extractSubFolder(sub);
  return Promise.all([
    pipeline(read, t),
    expect(getEntries(t)).resolves.toEqual<TarEntry[]>(
      [...tarEntries({ root: "" })].filter(e => e.headers.name.startsWith(sub)),
    ),
  ]);
});

test("throw error when there is multiple files or dirs at root", async () => {
  const read = Readable.from(tarEntries({ root: "" }));
  const t = extractSubFolder("dir1");

  const done = expect(pipeline(read, t)).rejects.toThrowError();
  t.read();

  await done;
});
