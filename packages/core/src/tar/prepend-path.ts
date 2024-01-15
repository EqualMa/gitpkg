import {
  HybridEntries,
  HybridEntry,
  headersOfEntry,
  modifyHeadersWithNewName,
} from "./entry";

/**
 *
 * @param prepend should be "" or end with "/". For example: `"package/"`
 */
export async function* prependPathOfEntries(
  entries: HybridEntries,
  prepend = "",
): AsyncGenerator<HybridEntry> {
  for await (const entry of entries) {
    const headers = headersOfEntry(entry);
    modifyHeadersWithNewName(headers, prepend + headers.name);
    yield entry;
  }
}
