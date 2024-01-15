import * as codes from "./http_status_code.js";
import { downloadGitPkg, getDefaultParser } from "@gitpkg/core";
import { extractInfoFromHttpError } from "./extract-http-error.js";
import got from "got";

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

    await downloadGitPkg(pkgOpts, got.stream, response);
  } catch (err) {
    const errMsg =
      (err ? (err as { message?: unknown }).message : "") || "no message";
    console.error(`request ${requestUrl} fail with message: ${errMsg}`);
    const { code, message } = extractInfoFromHttpError(err, {
      code: codes.INTERNAL_SERVER_ERROR,
      message: `download or parse fail for: ${requestUrl}`,
    });
    response.removeHeader("Content-Disposition");
    response.removeHeader("Content-Type");
    response.status(code).json(message);
  }
}
