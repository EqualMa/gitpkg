import * as codes from "./http_status_code";
import { pipelineToDownloadGitPkg, getDefaultParser } from "@gitpkg/core";
import * as stream from "stream";
import { promisify } from "util";
import { extractInfoFromHttpError } from "./extract-http-error";

const pipeline = promisify(stream.pipeline);

export interface PkgToResponseOptions {
  requestUrl: string | undefined;
  query: import("@now/node").NowRequestQuery;
  parseFromUrl: boolean;
  response: import("@now/node").NowResponse;
}

export async function pkg({
  requestUrl,
  query,
  parseFromUrl,
  response,
}: PkgToResponseOptions) {
  try {
    const pkgOpts = getDefaultParser(parseFromUrl).parse(
      requestUrl || "",
      query,
    );
    const { commitIshInfo: cii } = pkgOpts;

    response.status(200);
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${[
        cii.user,
        cii.repo,
        ...(cii.subdirs || []),
        cii.commit,
      ]
        .filter(Boolean)
        .join("-")}.tgz"`,
    );
    response.setHeader("Content-Type", "application/gzip");
    await pipeline([...pipelineToDownloadGitPkg(pkgOpts), response]);
  } catch (err) {
    console.error(`request ${requestUrl} fail with message: ${err.message}`);
    const { code, message } = extractInfoFromHttpError(err, {
      code: codes.INTERNAL_SERVER_ERROR,
      message: `download or parse fail for: ${requestUrl}`,
    });
    response.removeHeader("Content-Disposition");
    response.removeHeader("Content-Type");
    response.status(code).json(message);
  }
}
