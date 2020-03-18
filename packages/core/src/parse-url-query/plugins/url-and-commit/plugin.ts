import { PkgOptionsParserPlugin } from "../../parser";
import { fromUrl } from "./from-url";
import { fromQuery } from "./from-query";
import { CommitIshInfo } from "./commit-ish";

export { CommitIshInfo } from "./commit-ish";
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
