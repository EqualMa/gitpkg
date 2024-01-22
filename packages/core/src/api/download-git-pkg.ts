import * as tar from "tar-stream";
import { codeloadUrl } from "./codeload-url.js";
import { extractSubFolderOfEntries } from "../tar/extract-sub-folder.js";
import { addCustomScriptsToEntries } from "../tar/custom-scripts.js";
import { prependPathOfEntries } from "../tar/prepend-path.js";
import type { CommitIshInfo, PkgOptions } from "../parse-url-query/index.js";
import {
  HybridEntries,
  HybridEntry,
  hybridEntriesFromEntries,
} from "../tar/entry.js";
import { pack } from "../tar/pack.js";
import {
  DecompressionStream,
  CompressionStream,
} from "@gitpkg/edge-polyfill/dist/compression-streams.js";
import {
  readableToWeb,
  writableToWeb,
} from "@gitpkg/edge-polyfill/dist/web-stream.js";

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

export function getTgzUrl(cii: CommitIshInfo): string {
  return codeloadUrl(`${cii.user}/${cii.repo}`, cii.commit);
}

export function downloadGitPkg(
  pkgOpts: PkgOptions,
  readable: ReadableStream,
  writable: WritableStream,
): Promise<unknown> {
  const extract = tar.extract();

  let gen: AsyncGenerator<HybridEntry> = hybridEntriesFromEntries(extract);
  for (const genFn of pipelineToPkgTarEntries(pkgOpts)) {
    gen = genFn(gen);
  }

  const pipe = readable
    .pipeThrough(new DecompressionStream("gzip"))
    .pipeTo(writableToWeb(extract) satisfies WritableStream);
  const [p, packPromise] = pack(gen);

  const pipeOut = (readableToWeb(p) satisfies ReadableStream)
    .pipeThrough(new CompressionStream("gzip"))
    .pipeTo(writable);
  return Promise.all([pipe, packPromise, pipeOut]);
}
