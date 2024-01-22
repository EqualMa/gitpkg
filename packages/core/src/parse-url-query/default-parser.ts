import { PkgOptionsParser } from "./parser.js";
import { getUrlAndCommitPlugin, customScriptsPlugin } from "./plugins/index.js";

const getParser = (parseFromUrl: boolean) =>
  new PkgOptionsParser()
    .withPlugin(getUrlAndCommitPlugin(parseFromUrl))
    .withPlugin(customScriptsPlugin);

const parserFromUrl = getParser(true);
const parserFromQuery = getParser(false);

export const getDefaultParser = (parseFromUrl = false) =>
  parseFromUrl ? parserFromUrl : parserFromQuery;

export type PkgOptions =
  ReturnType<typeof getDefaultParser> extends PkgOptionsParser<infer T>
    ? T
    : never;
