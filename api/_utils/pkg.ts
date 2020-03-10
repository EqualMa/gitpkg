import * as codes from "../_http_status_code";
import {
  subFolderStreamOfTar,
  parseCommitUrl,
  codeloadUrl,
  CommitIshInfo,
  PkgRequestQuery,
} from "@gitpkg/core";
import stream from "stream";
import { promisify } from "util";
import got from "got";
import gunzip from "gunzip-maybe";
import zlib from "zlib";
import { extractInfoFromHttpError } from "./extract-http-error";

const pipeline = promisify(stream.pipeline);

interface PkgCommitInfoOptions {
  requestUrl: string | undefined;
  commitInfo: CommitIshInfo;
  response: import("@now/node").NowResponse;
}

async function pkgCommitInfo({
  requestUrl,
  commitInfo,
  response,
}: PkgCommitInfoOptions) {
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
    console.error(`request ${requestUrl} fail with message: ${err.message}`);
    const { code, message } = extractInfoFromHttpError(err, {
      code: codes.INTERNAL_SERVER_ERROR,
      message: `download or parse fail for: ${tgzUrl}`,
    });
    response.removeHeader("Content-Disposition");
    response.removeHeader("Content-Type");
    response.status(code).json(message);
  }
}

export interface PkgOptions {
  requestUrl: string | undefined;
  query: PkgRequestQuery;
  response: import("@now/node").NowResponse;
}

export async function pkg({ query, requestUrl, response }: PkgOptions) {
  const { url, commit } = query;

  const commitInfo = typeof url === "string" ? parseCommitUrl(url) : null;

  if (!commitInfo) {
    response.status(codes.BAD_REQUEST).json(`param url is invalid: ${url}`);
    return;
  }

  if (typeof commit !== "undefined" && typeof commit !== "string") {
    response
      .status(codes.BAD_REQUEST)
      .json(`param commit is invalid: ${commit}`);
    return;
  }

  if (commitInfo.commit && commit && commitInfo.commit !== commit) {
    response
      .status(codes.BAD_REQUEST)
      .json(
        `param commit is specified from both url(${url}) and query(commit=${commit})`,
      );
    return;
  }
  if (!commitInfo.commit && commit && commit.trim()) {
    commitInfo.commit = commit.trim();
  }

  await pkgCommitInfo({
    commitInfo,
    response,
    requestUrl,
  });
}
