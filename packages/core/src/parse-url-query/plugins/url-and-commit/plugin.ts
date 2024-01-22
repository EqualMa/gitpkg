import type { PkgOptionsParserPlugin } from "../../parser.js";
import { fromUrl } from "./from-url.js";
import { fromQuery } from "./from-query.js";
import { CommitIshInfo } from "./commit-ish.js";

export { CommitIshInfo } from "./commit-ish.js";
export interface PkgUrlAndCommitOptions {
  url: string;
  commit: undefined | string;
  parsedFromUrl: boolean;
  commitIshInfo: CommitIshInfo;
}

export const getUrlAndCommitPlugin = (
  parseFromUrl = false,
): PkgOptionsParserPlugin<unknown, PkgUrlAndCommitOptions> =>
  parseFromUrl ? fromUrl : fromQuery;
