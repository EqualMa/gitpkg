import { PkgOptionsParserPlugin } from "../../parser.js";
import { PkgUrlAndCommitOptions } from "./plugin.js";
import { parseCommitIshInfo } from "./commit-ish.js";
import { QueryParamsInvalidError, UrlInvalidError } from "../../error.js";
import { RequestQuery } from "../../query.js";
import { commitFromQueryParams } from "./from-query.js";

function valueIsShortcutCommit(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) {
    const emptyValues = value.filter(v => v === "");
    if (emptyValues.length === 1) {
      return true;
    } else if (emptyValues.length > 1) {
      throw new UrlInvalidError(
        "The same shortcut commit query param is specified multiple times",
      );
    } else return false;
  } else {
    return value === "";
  }
}

function getShortcutCommitFromQuery(query: RequestQuery): string | undefined {
  let commit: undefined | string[] | string = undefined;
  for (const [key, value] of Object.entries(query)) {
    if (valueIsShortcutCommit(value)) {
      if (commit === undefined) {
        commit = key;
      } else {
        if (typeof commit === "string") {
          commit = [commit, key];
        } else {
          commit.push(key);
        }
      }
    }
  }

  if (Array.isArray(commit))
    throw new UrlInvalidError(
      "Too many shortcut commit query params: " + commit.join(", "),
    );

  // url = /foo/bar?master&commit=master
  if (typeof commit === "string" && query.commit) {
    throw new QueryParamsInvalidError(
      "commit",
      `param commit is specified from both shortcut commit(${commit}) and query(commit=${commit})`,
    );
  }

  return commit;
}

export const fromUrl: PkgOptionsParserPlugin<
  unknown,
  PkgUrlAndCommitOptions
> = (requestPathName, query) => {
  if (!requestPathName.startsWith("/")) {
    throw new UrlInvalidError("Pathname must start with '/'");
  }

  const url = requestPathName.slice(1);

  let commitFrom: PkgUrlAndCommitOptions["commitFrom"] = "shortcut";
  let commit = getShortcutCommitFromQuery(query);
  if (commit === undefined) {
    commitFrom = "query";
    commit = commitFromQueryParams(query);
  }

  const urlFrom = "pathname";

  return {
    url,
    commit,
    urlFrom,
    commitFrom,
    commitIshInfo: parseCommitIshInfo(url, commit, urlFrom),
  };
};
