import got from "got";
import * as tt from "tar-transform";
import { codeloadUrl } from "./codeload-url";
import { extractSubFolder } from "../tar/extract-sub-folder";
import { customScripts } from "../tar/custom-scripts";
import { prependPath } from "../tar/prepend-path";
import { PkgOptions } from "../parse-url-query";

export type PipelineItem =
  | NodeJS.ReadableStream
  | NodeJS.WritableStream
  | NodeJS.ReadWriteStream;

export function pipelineToPkgTarEntries(
  pkgOpts: PkgOptions,
): NodeJS.ReadWriteStream[] {
  const { customScripts: cs, commitIshInfo: cii } = pkgOpts;

  return [
    extractSubFolder(cii.subdir),
    cs && cs.length > 0 && customScripts(cs),
    prependPath("package/"),
  ].filter(Boolean) as NodeJS.ReadWriteStream[];
}

export function pipelineToDownloadGitPkg(pkgOpts: PkgOptions): PipelineItem[] {
  const { commitIshInfo: cii } = pkgOpts;

  const tgzUrl = codeloadUrl(`${cii.user}/${cii.repo}`, cii.commit);

  return [
    got.stream(tgzUrl),
    tt.extract({ gzip: true }),
    ...pipelineToPkgTarEntries(pkgOpts),
    tt.pack({ gzip: true }),
  ];
}
