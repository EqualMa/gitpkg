import { match } from "path-to-regexp";

const matchFromUrl = match<MatchResult>(
  "/:url((?:[^?]+/)+[^?]+){\\?:commit([^?&=]+)}?(.+)?",
);

interface MatchResult {
  url: string;
  commit?: string;
}

export interface PkgRequestQuery {
  url?: string | string[];
  commit?: string | string[];
}

export function extractQueryFromUrl(
  url: string | null | undefined,
): PkgRequestQuery | null {
  if (!url) return null;

  const res = matchFromUrl(url);
  if (!res) {
    return null;
  } else {
    const { url, commit } = res.params;
    return {
      url: decodeURIComponent(url),
      commit: commit && decodeURIComponent(commit),
    };
  }
}
