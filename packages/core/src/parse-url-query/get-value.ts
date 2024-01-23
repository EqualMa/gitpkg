import type { PkgUrlAndCommitOptions } from "./plugins/index.js";
import type { RequestQuery } from "./query.js";

export function getValueOfQuery(
  query: RequestQuery,
  key: string,
  options: PkgUrlAndCommitOptions,
): undefined | string | string[] {
  const commitFromShortcut: string | undefined =
    options.commitFrom === "shortcut" ? options.commit : undefined;
  const v: undefined | string | string[] = query[key];

  // Remove empty string from value
  if (key === commitFromShortcut) {
    if (typeof v === "string") {
      if (v !== "")
        throw new Error(
          `Invalid State: value of ${key} should be empty string`,
        );

      return undefined;
    } else if (Array.isArray(v)) {
      const values = v.filter(vv => vv !== "");

      if (values.length !== v.length - 1)
        throw new Error(
          `Invalid State: values of ${key} should contain exactly one empty string`,
        );

      if (values.length === 0) return undefined;
      else return values;
    }
  } else return v;
}
