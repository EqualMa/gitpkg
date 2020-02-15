import { match } from "path-to-regexp";

export const codeloadUrl = (repo: string, commit: string) =>
  `https://codeload.github.com/${repo}/tar.gz/${commit}`;

export interface CommitIshInfoMatchResult {
  user: string;
  repo: string;
  subdir?: string[];
  commit?: string;
}

export interface CommitIshInfo {
  user: string;
  repo: string;
  /** "" or a string which ends with "/" or undefined */
  subdir: string | undefined;
  commit: string | undefined;
}

const matchCommitIshInfo = match<CommitIshInfoMatchResult>(
  ":user/:repo/:subdir*(/)?{#:commit}?",
);

export function parseCommitUrl(url: string): CommitIshInfo | null {
  const res = matchCommitIshInfo(url);

  if (res === false) {
    return null;
  }

  const { user, repo, subdir, commit } = res.params;
  return {
    user,
    repo,
    subdir: subdir ? subdir.join("/") + "/" : undefined,
    commit,
  };
}
