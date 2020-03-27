import { match } from "path-to-regexp";
import { PkgUrlAndCommitOptions } from "./plugin";
import { UrlInvalidError, QueryParamsInvalidError } from "../../error";

interface CommitIshInfoMatchResult {
  user: string;
  repo: string;
  subdirs?: string[];
}
const matchCommitIshInfo = match<CommitIshInfoMatchResult>(
  ":user/:repo/:subdirs*(/)?",
);

export interface CommitIshInfo {
  user: string;
  repo: string;
  /** "" or a string which ends with "/" */
  subdir: string;
  subdirs: string[] | undefined;
  commit: string;
}

const DEFAULT_COMMIT_ISH = "master";

export function parseCommitIshInfo(
  url: PkgUrlAndCommitOptions["url"],
  commit: PkgUrlAndCommitOptions["commit"],
  parsedFromUrl: PkgUrlAndCommitOptions["parsedFromUrl"],
): CommitIshInfo {
  const res = matchCommitIshInfo(url);

  if (res === false) {
    throw parsedFromUrl
      ? new UrlInvalidError()
      : new QueryParamsInvalidError("url");
  }

  const { user, repo, subdirs } = res.params;
  return {
    user,
    repo,
    subdir: subdirs ? subdirs.join("/") + "/" : "",
    subdirs,
    commit: commit || DEFAULT_COMMIT_ISH,
  };
}
