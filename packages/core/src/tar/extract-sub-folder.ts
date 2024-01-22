import {
  HybridEntries,
  HybridEntry,
  headersOfEntry as entryHeaders,
  modifyHeadersWithNewName,
  resumeEntry,
} from "./entry.js";

export async function* extractSubFolderOfEntries(
  entries: HybridEntries,
  subFolder: string,
  prepend = "",
): AsyncGenerator<HybridEntry> {
  const ctx: { root: string | undefined } = { root: undefined };

  let error: Error | undefined;

  for await (const entry of entries) {
    if (error) {
      // the Readable must be consumed, otherwise ERR_STREAM_PREMATURE_CLOSE would be thrown
      resumeEntry(entry);
      continue;
    }
    const headers = entryHeaders(entry);
    const name = headers.name;
    if (ctx.root === undefined) {
      if (headers.type !== "directory") {
        error = new Error("invalid source file: first entry is not directory");
        continue;
      }
      ctx.root = name;

      resumeEntry(entry);
    } else if (name.startsWith(ctx.root)) {
      if (headers.pax && headers.pax.path !== name) {
        error = new Error(
          "source file is not valid due to tarball pax header mismatch",
        );
        continue;
      }

      const dir = ctx.root + subFolder;
      if (name.startsWith(dir) && name.length > dir.length) {
        modifyHeadersWithNewName(headers, prepend + name.slice(dir.length));

        yield entry;
      } else {
        resumeEntry(entry);
      }
    } else {
      error = new Error("invalid source file: multiple dirs in root");
      continue;
    }
  }

  if (error) throw error;
}
