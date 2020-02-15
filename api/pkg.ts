import { NowRequest, NowResponse } from "@now/node";

import stream from "stream";
import { promisify } from "util";
import got from "got";
import gunzip from "gunzip-maybe";
import zlib from "zlib";

import { parseCommitUrl, codeloadUrl } from "./_utils/parse-url";
import { subFolderStreamOfTar } from "./_utils/extract-sub-folder";
import * as codes from "./_http_status_code";

const pipeline = promisify(stream.pipeline);

export default async (request: NowRequest, response: NowResponse) => {
  const { url } = request.query;

  const commitInfo = typeof url === "string" ? parseCommitUrl(url) : null;

  if (!commitInfo) {
    response.status(codes.BAD_REQUEST).json(`param url not valid: ${url}`);
    return;
  }

  const tgzUrl = codeloadUrl(
    `${commitInfo.user}/${commitInfo.repo}`,
    commitInfo.commit || "master",
  );

  const { extract, pack } = subFolderStreamOfTar(commitInfo.subdir || "");
  const gzip = zlib.createGzip();

  try {
    await Promise.all([
      pipeline(got.stream(tgzUrl), gunzip(), extract),
      pipeline(pack, gzip, response),
    ]);
    response.status(200).json(`done: ` + __dirname);
  } catch (err) {
    console.error(`request ${request.url} fail with message: ${err.message}`);
    response
      .status(codes.INTERNAL_SERVER_ERROR)
      .json(`download or parse fail for: ${tgzUrl}`);
  }
};
