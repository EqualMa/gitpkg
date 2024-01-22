import * as tar from "tar-stream";
import {
  DecodedEntry,
  HybridEntries,
  HybridEntry,
  headersOfEntry,
  hybridEntriesFromDecodedEntries,
  hybridEntriesFromEntries,
  readEntryContent,
  resumeEntry,
} from "../../src/tar/entry.js";
import { pack as packHybridEntries } from "../../src/tar/pack.js";

/**
 * Make headers.mtime a constant date.
 */
export function normalizeDecodedEntry(entry: DecodedEntry): DecodedEntry {
  const headers = { ...entry.headers };
  headers.mtime = new Date(0);
  return { headers, content: entry.content };
}

export async function collect<T>(r: AsyncIterable<T>): Promise<T[]> {
  const entries: T[] = [];
  for await (const v of r) {
    entries.push(v);
  }
  return entries;
}

export async function* readAndDecodeEntries(
  r: HybridEntries,
): AsyncGenerator<DecodedEntry> {
  let error: Error | undefined;
  for await (const entry of r) {
    if (error) {
      resumeEntry(entry);
      continue;
    }

    const headers = headersOfEntry(entry);
    let content: string | undefined = await readEntryContent(entry);
    if (headers.type === "directory") {
      if (!(content === undefined || content === "")) {
        error = new Error("directory content should be empty");
        resumeEntry(entry);
        continue;
      }
      content = undefined;
    }
    yield { headers, content };
  }

  if (error) throw error;
}

export function decodeAndCollectHybridEntries(
  r: AsyncIterable<HybridEntry>,
): Promise<DecodedEntry[]> {
  return collect(readAndDecodeEntries(r));
}

export function decodeAndCollectEntries(
  r: AsyncIterable<tar.Entry>,
): Promise<DecodedEntry[]> {
  return decodeAndCollectHybridEntries(hybridEntriesFromEntries(r));
}

export function* tarEntries({
  count = 10,
  depth = 3,
  root = "",
} = {}): Generator<DecodedEntry> {
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

export function tarEntriesPack(
  ...args: Parameters<typeof tarEntries>
): tar.Pack {
  return pack(tarEntries(...args));
}

export function pack(entries: Iterable<DecodedEntry>): tar.Pack {
  return packHybridEntries(hybridEntriesFromDecodedEntries(entries))[0];
}

export function packAndExtract(entries: Iterable<DecodedEntry>): tar.Extract {
  const x = tar.extract();

  pack(entries).pipe(x);

  return x;
}

export function tarEntriesPackAndExtract(
  ...args: Parameters<typeof tarEntries>
): tar.Extract {
  return packAndExtract(tarEntries(...args));
}
