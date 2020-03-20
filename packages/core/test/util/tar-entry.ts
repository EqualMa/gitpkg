import { TarEntry, isTarEntry } from "tar-transform";
import { Readable } from "stream";

export async function getEntries(r: Readable) {
  const entries: TarEntry[] = [];
  for await (const v of r) {
    if (isTarEntry(v)) {
      entries.push(v);
    } else {
      throw new Error("invalid tar entry");
    }
  }
  return entries;
}

export function* tarEntries({
  count = 10,
  depth = 3,
  root = "",
} = {}): Generator<TarEntry> {
  const dirs: Record<string, true> = {};
  if (root) {
    dirs[root] = true;
    yield { headers: { name: root, type: "directory" } };
  }
  for (let i = 0; i < count; i++) {
    const dirName =
      root + [...new Array(i % depth).keys()].map(dir => `dir${dir}/`).join("");

    if (dirName && !dirs[dirName]) {
      dirs[dirName] = true;
      yield { headers: { name: dirName, type: "directory" } };
    }
    const fileName = dirName + `file${i}.data`;
    yield { headers: { name: fileName }, content: String(i) };
  }
}
