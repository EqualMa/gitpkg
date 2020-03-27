import { match } from "path-to-regexp";
import { PkgOptionsParserPlugin } from "../../parser";
import { PkgUrlAndCommitOptions } from "./plugin";
import { parseCommitIshInfo } from "./commit-ish";
import { QueryParamsInvalidError, UrlInvalidError } from "../../error";

const matchFromUrl = match<MatchResult>(
  "/:url((?:[^?]+/)+[^?]+){\\?:commit([^?&=]+)}?(.+)?",
);

interface MatchResult {
  url: string;
  commit?: string;
}

export const fromUrl: PkgOptionsParserPlugin<
  unknown,
  PkgUrlAndCommitOptions
> = (requestUrl, query) => {
  const res = matchFromUrl(requestUrl);
  if (!res) {
    throw new UrlInvalidError();
  } else {
    const { url: u, commit: c } = res.params;
    const url = decodeURIComponent(u);
    const commit = c && decodeURIComponent(c);

    if (query.commit)
      // url = /foo/bar?master&commit=master
      throw new QueryParamsInvalidError(
        "commit",
        `param commit is specified from both url(${url}) and query(commit=${commit})`,
      );

    return {
      url,
      commit,
      parsedFromUrl: true,
      commitIshInfo: parseCommitIshInfo(url, commit, true),
    };
  }
};
