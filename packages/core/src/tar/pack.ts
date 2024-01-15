import * as tar from "tar-stream";
import { pipeline } from "stream/promises";
import {
  HybridEntries,
  HybridEntry,
  contentOfEntry,
  headersOfEntry,
} from "./entry";

function writeEntryToPack(entry: HybridEntry, pack: tar.Pack): Promise<void> {
  const headers = headersOfEntry(entry);
  const content = contentOfEntry(entry);

  switch (content.kind) {
    case "stream":
      return new Promise<void>((resolve, reject) => {
        const entry = pack.entry(headers, error => {
          if (error) {
            reject(error);
          } else {
            resolve(pipe);
          }
        });
        const pipe = pipeline(content.content, entry);
      });
    case "decoded":
      return new Promise<void>((resolve, reject) => {
        pack.entry(headers, content.content, error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
  }
}

async function writeEntriesToPackAndFinalize(
  entries: HybridEntries,
  pack: tar.Pack,
) {
  let errored: { error: unknown } | undefined;
  for await (const entry of entries) {
    try {
      await writeEntryToPack(entry, pack);
    } catch (error) {
      errored = { error };
      break;
    }
  }

  if (errored) {
    pack.destroy(errored.error as Error);
  } else {
    pack.finalize();
  }
}

export function pack(entries: HybridEntries): [tar.Pack, Promise<void>] {
  const pack = tar.pack();

  return [pack, writeEntriesToPackAndFinalize(entries, pack)];
}
