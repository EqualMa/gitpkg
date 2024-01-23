import { PkgOptionsParserPlugin } from "../../parser.js";
import {
  PkgCustomScript,
  queryKeyIsCustomScript,
  parseQueryAsCustomScript,
} from "./parse-query.js";
import type { PkgUrlAndCommitOptions } from "../url-and-commit/index.js";
import { getValueOfQuery } from "../../get-value.js";

export interface PkgCustomScriptsOptions {
  customScripts: PkgCustomScript[];
}

export const customScriptsPlugin: PkgOptionsParserPlugin<
  PkgUrlAndCommitOptions,
  PkgCustomScriptsOptions
> = (requestPathName, query, previousOptions) => {
  return {
    customScripts: Reflect.ownKeys(query)
      .map(k => {
        if (queryKeyIsCustomScript(k)) {
          const v = getValueOfQuery(query, k, previousOptions);
          if (v) {
            return parseQueryAsCustomScript(k, v);
          } else return null;
        } else {
          return null;
        }
      })
      .filter(Boolean as unknown as (v: unknown) => v is PkgCustomScript),
  };
};
