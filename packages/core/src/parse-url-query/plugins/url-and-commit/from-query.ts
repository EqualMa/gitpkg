import { PkgOptionsParserPlugin } from "../../parser";
import { QueryParamsInvalidError } from "../../error";
import { PkgUrlAndCommitOptions } from "./plugin";
import { parseCommitIshInfo } from "./commit-ish";

export const fromQuery: PkgOptionsParserPlugin<
  unknown,
  PkgUrlAndCommitOptions
> = (requestUrl, query) => {
  const { url, commit } = query;
  if (typeof url !== "string") {
    throw new QueryParamsInvalidError("url");
  }
  if (typeof commit !== "string" && typeof commit !== "undefined") {
    throw new QueryParamsInvalidError("commit");
  }
  return {
    url,
    commit,
    parsedFromUrl: false,
    commitIshInfo: parseCommitIshInfo(url, commit, false),
  };
};
