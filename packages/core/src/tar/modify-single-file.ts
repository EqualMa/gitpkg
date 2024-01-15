import { HybridEntries, HybridEntry, headersOfEntry } from "./entry";

type MaybePromise<T> = T | Promise<T>;

/**
 * `entries` will always be drained no matter if modify throws an error.
 *
 * Throws an error when `entries` doesn't contain an entry matching `filePath`.
 */
export async function* modifySingleFileOfEntries(
  entries: HybridEntries,
  filePath: string,
  modify: (entry: HybridEntry) => MaybePromise<HybridEntry>,
): AsyncGenerator<HybridEntry> {
  let matched = false;
  let error: Error | undefined;

  for await (const entry of entries) {
    if (error) continue;

    if (headersOfEntry(entry).name === filePath) {
      if (matched) {
        error = new Error(`invalid state`);
        continue;
      }
      matched = true;
      const newEntry = await modify(entry);

      yield newEntry;
    } else {
      yield entry;
    }
  }

  if (error) throw error;
  if (!matched) {
    throw new Error(`file not found: ${filePath}`);
  }
}
