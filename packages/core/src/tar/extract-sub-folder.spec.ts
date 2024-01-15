import { extractSubFolderOfEntries } from "./extract-sub-folder";
import {
  tarEntries,
  tarEntriesPackAndExtract,
  decodeAndCollectEntries,
  normalizeDecodedEntry,
  packAndExtract,
  decodeAndCollectHybridEntries,
} from "../../test/util/tar-entry";
import { headersOfEntry, hybridEntriesFromEntries } from "./entry";

test("do not extract sub folder (only extract root folder)", async () => {
  const t = extractSubFolderOfEntries(
    hybridEntriesFromEntries(tarEntriesPackAndExtract({ root: "root/" })),
    "",
  );

  const result = await decodeAndCollectHybridEntries(t);

  const expected = await decodeAndCollectEntries(
    tarEntriesPackAndExtract({ root: "" }),
  );

  expect(result.map(normalizeDecodedEntry)).toEqual(
    expected.map(normalizeDecodedEntry),
  );
});

test("extract sub folder", async () => {
  const sub = "dir1/";

  const t = extractSubFolderOfEntries(
    hybridEntriesFromEntries(tarEntriesPackAndExtract({ root: "root/" })),
    sub,
  );

  const result = await decodeAndCollectHybridEntries(t);

  const expected = await decodeAndCollectEntries(
    packAndExtract(
      [...tarEntries({ root: "" })].filter(e => e.headers.name.startsWith(sub)),
    ),
  );

  expect(result.map(normalizeDecodedEntry)).toEqual(
    expected.map(normalizeDecodedEntry),
  );
});

test("throw error when there is multiple files or dirs at root", () => {
  const t = extractSubFolderOfEntries(
    hybridEntriesFromEntries(tarEntriesPackAndExtract({ root: "" })),
    "dir1",
  );
  return expect(decodeAndCollectHybridEntries(t)).rejects.toEqual(
    new Error("invalid source file: first entry is not directory"),
  );
});

test("error handling when using for await of", async () => {
  const MSG = "MY MESSAGE";
  const x = tarEntriesPackAndExtract({ root: "root/" });
  await expect(async () => {
    let error: Error | undefined;
    for await (const entry of extractSubFolderOfEntries(
      hybridEntriesFromEntries(x),
      "",
    )) {
      if (error) {
        continue;
      }
      if (headersOfEntry(entry).name === "dir0/dir1/") {
        error = new Error(MSG);
      }
    }

    if (error) {
      throw error;
    }
  }).rejects.toEqual(new Error(MSG));

  expect(x.destroyed).toBe(true);

  for await (const _ of x) {
    expect("").toEqual("unreachable");
  }
});
