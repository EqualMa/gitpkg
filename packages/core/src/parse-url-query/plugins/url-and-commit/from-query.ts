import { PkgOptionsParserPlugin } from "../../parser.js";
import { QueryParamsInvalidError } from "../../error.js";
import { PkgUrlAndCommitOptions } from "./plugin.js";
import { parseCommitIshInfo } from "./commit-ish.js";
import type { RequestQuery } from "../../query.js";

export function commitFromQueryParams(query: RequestQuery): string | undefined {
  const commit = query.commit;
  if (typeof commit !== "string" && typeof commit !== "undefined") {
    throw new QueryParamsInvalidError("commit");
  }

  return commit;
}

export const fromQuery: PkgOptionsParserPlugin<
  unknown,
  PkgUrlAndCommitOptions
> = (requestPathName, query) => {
  const { url } = query;
  if (typeof url !== "string") {
    throw new QueryParamsInvalidError("url");
  }

  const commit = commitFromQueryParams(query);

  const urlFrom = "query";
  return {
    url,
    commit,
    urlFrom,
    commitFrom: "query",
    commitIshInfo: parseCommitIshInfo(url, commit, urlFrom),
  };
};
