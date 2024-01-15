import { modifySingleFile } from "./modify-single-file";
import { PkgCustomScript } from "../parse-url-query";

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

export const customScripts = (scripts: PkgCustomScript[]) =>
  modifySingleFile("package.json", async function (entry) {
    const pkgJson = JSON.parse(await this.util.stringContentOfTarEntry(entry));
    addScriptsToPkgJson(pkgJson, scripts);
    return { content: JSON.stringify(pkgJson, undefined, 2) };
  });
