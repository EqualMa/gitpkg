import { PkgOptionsParser } from "./parser";
import { getUrlAndCommitPlugin, customScriptsPlugin } from "./plugins";

const getParser = (parseFromUrl: boolean) =>
  new PkgOptionsParser()
    .withPlugin(getUrlAndCommitPlugin(parseFromUrl))
    .withPlugin(customScriptsPlugin);

const parserFromUrl = getParser(true);
const parserFromQuery = getParser(false);

export const getDefaultParser = (parseFromUrl = false) =>
  parseFromUrl ? parserFromUrl : parserFromQuery;

export type PkgOptions = ReturnType<
  typeof getDefaultParser
> extends PkgOptionsParser<infer T>
  ? T
  : never;
