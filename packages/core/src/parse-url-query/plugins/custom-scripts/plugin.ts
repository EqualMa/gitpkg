import { PkgOptionsParserPlugin } from "../../parser";
import {
  PkgCustomScript,
  queryKeyIsCustomScript,
  parseQueryAsCustomScript,
} from "./parse-query";
import { PkgUrlAndCommitOptions } from "../url-and-commit";
import { getValueOfQuery } from "../../get-value";

export interface PkgCustomScriptsOptions {
  customScripts: PkgCustomScript[];
}

export const customScriptsPlugin: PkgOptionsParserPlugin<
  PkgUrlAndCommitOptions,
  PkgCustomScriptsOptions
> = (requestUrl, query, previousOptions) => {
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
      .filter((Boolean as unknown) as (v: unknown) => v is PkgCustomScript),
  };
};
