import { modifySingleFileOfEntries } from "./modify-single-file";
import { PkgCustomScript } from "../parse-url-query";
import {
  HybridEntries,
  HybridEntry,
  headersOfEntry,
  readEntryContent,
} from "./entry";

export function addScriptsToPkgJson(
  pkgJson: Record<string, unknown>,
  scripts: PkgCustomScript[],
) {
  const pkgScripts = (pkgJson.scripts || (pkgJson.scripts = {})) as Record<
    string,
    string
  >;

  for (const s of scripts) {
    const { type, name, script } = s;

    if (type === "replace") {
      pkgScripts[name] = script;
    } else if (type === "prepend") {
      const original = pkgScripts[name];
      const str = original ? " && " + original : "";
      pkgScripts[name] = script + str;
    } else if (type === "append") {
      const original = pkgScripts[name];
      const str = original ? original + " && " : "";
      pkgScripts[name] = str + script;
    } else throw new Error("prop type is invalid: " + type);
  }
}

export function addCustomScriptsToEntries(
  entries: HybridEntries,
  scripts: PkgCustomScript[],
): AsyncGenerator<HybridEntry> {
  return modifySingleFileOfEntries(
    entries,
    "package.json",
    async function (entry): Promise<HybridEntry> {
      const pkgContent = (await readEntryContent(entry)) ?? "";
      const pkgJson = JSON.parse(pkgContent);
      addScriptsToPkgJson(pkgJson, scripts);
      return {
        kind: "decoded",
        entry: {
          headers: headersOfEntry(entry),
          content: JSON.stringify(pkgJson, undefined, 2),
        },
      };
    },
  );
}
