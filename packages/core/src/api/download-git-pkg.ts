import * as tar from "tar-stream";
import { codeloadUrl } from "./codeload-url";
import { extractSubFolderOfEntries } from "../tar/extract-sub-folder";
import { addCustomScriptsToEntries } from "../tar/custom-scripts";
import { prependPathOfEntries } from "../tar/prepend-path";
import { PkgOptions } from "../parse-url-query";
import { createGunzip, createGzip } from "zlib";
import type { Readable, Writable } from "stream";
import { pipeline } from "stream/promises";
import {
  HybridEntries,
  HybridEntry,
  hybridEntriesFromEntries,
} from "../tar/entry";
import { pack } from "../tar/pack";

export type PipelineItem =
  | NodeJS.ReadableStream
  | NodeJS.WritableStream
  | NodeJS.ReadWriteStream;

type GenFn = (entries: HybridEntries) => AsyncGenerator<HybridEntry>;

function pipelineToPkgTarEntries(pkgOpts: PkgOptions): GenFn[] {
  const { customScripts: cs, commitIshInfo: cii } = pkgOpts;

  return (
    [
      (entries: HybridEntries) =>
        extractSubFolderOfEntries(entries, cii.subdir),
      cs && cs.length > 0
        ? (entries: HybridEntries) => addCustomScriptsToEntries(entries, cs)
        : undefined,
      (entries: HybridEntries) => prependPathOfEntries(entries, "package/"),
    ] satisfies (GenFn | undefined)[]
  ).filter(Boolean as unknown as <T>(v: T) => v is Exclude<T, undefined>);
}

export function downloadGitPkg(
  pkgOpts: PkgOptions,
  getReadable: (tgzUrl: string) => Readable,
  writable: Writable,
): Promise<unknown> {
  const { commitIshInfo: cii } = pkgOpts;

  const tgzUrl = codeloadUrl(`${cii.user}/${cii.repo}`, cii.commit);

  const extract = tar.extract();

  let gen: AsyncGenerator<HybridEntry> = hybridEntriesFromEntries(extract);
  for (const genFn of pipelineToPkgTarEntries(pkgOpts)) {
    gen = genFn(gen);
  }

  const pipe = pipeline([getReadable(tgzUrl), createGunzip(), extract]);

  const [p, packPromise] = pack(gen);

  const gzip = createGzip();
  const pipeOut = pipeline(
    [p, gzip, writable].filter(
      Boolean as unknown as <T>(v: T | undefined) => v is T,
    ),
  );

  return Promise.all([pipe, packPromise, pipeOut]);
}
