import { NowRequest, NowResponse } from "@now/node";

import stream from "stream";
import { promisify } from "util";
import got from "got";
import gunzip from "gunzip-maybe";
import zlib from "zlib";

import { parseCommitUrl, codeloadUrl } from "./_utils/parse-url";
import { subFolderStreamOfTar } from "./_utils/extract-sub-folder";
import * as codes from "./_http_status_code";
import { extractInfoFromHttpError } from "./_utils/extract-http-error";

const pipeline = promisify(stream.pipeline);

export default async (request: NowRequest, response: NowResponse) => {
  const { url, commit } = request.query;

  const commitInfo = typeof url === "string" ? parseCommitUrl(url) : null;

  if (!commitInfo) {
    response.status(codes.BAD_REQUEST).json(`param url not valid: ${url}`);
    return;
  }

  if (typeof commit !== "undefined" && typeof commit !== "string") {
    response
      .status(codes.BAD_REQUEST)
      .json(`param commit not valid: ${commit}`);
    return;
  }

  commitInfo.commit = commit.trim();

  const tgzUrl = codeloadUrl(
    `${commitInfo.user}/${commitInfo.repo}`,
    commitInfo.commit || "master",
  );

  const { extract, pack } = subFolderStreamOfTar(commitInfo.subdir || "");
  const gzip = zlib.createGzip();

  try {
    response.status(200);
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${[
        commitInfo.user,
        commitInfo.repo,
        ...(commitInfo.subdirs || []),
        commitInfo.commit,
      ]
        .filter(Boolean)
        .join("-")}.tgz"`,
    );
    response.setHeader("Content-Type", "application/gzip");

    await Promise.all([
      pipeline(got.stream(tgzUrl), gunzip(), extract),
      pipeline(pack, gzip, response),
    ]);
  } catch (err) {
    console.error(`request ${request.url} fail with message: ${err.message}`);

    const { code, message } = extractInfoFromHttpError(err, {
      code: codes.INTERNAL_SERVER_ERROR,
      message: `download or parse fail for: ${tgzUrl}`,
    });

    response.removeHeader("Content-Disposition");
    response.removeHeader("Content-Type");
    response.status(code).json(message);
  }
};
