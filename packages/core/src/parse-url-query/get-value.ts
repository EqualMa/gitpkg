import { PkgUrlAndCommitOptions } from "./plugins";

export function getValueOfQuery(
  query: import("@now/node").NowRequestQuery,
  key: string,
  options: PkgUrlAndCommitOptions,
): undefined | string | string[] {
  const commitFromUrl: string | undefined = options.parsedFromUrl
    ? options.commit
    : undefined;
  const v: undefined | string | string[] = query[key];

  if (key === commitFromUrl) {
    if (typeof v === "string") {
      return v === commitFromUrl ? undefined : v;
    } else if (Array.isArray(v)) {
      if (v.length === 0) return undefined;
      if (v[0] === commitFromUrl) {
        if (v.length === 1) return undefined;
        else v.slice(1);
      }
    }
  } else return v;
}
