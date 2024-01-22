import * as codes from "./http_status_code.js";
import { Buffer } from "buffer";

// FIXME: use module instead of relative path
import {
  downloadGitPkg,
  getTgzUrl,
} from "../../packages/core/src/api/download-git-pkg.js";
import {
  getDefaultParser,
  paramsToQuery,
  type RequestQuery,
} from "../../packages/core/src/parse-url-query/index.js";

/**
 *
 * @param url `request.url`, the full url
 * @returns `requestUrl` is `pathname + search`, without hash
 */
export function parseUrl(url: string): {
  query: RequestQuery;
  requestUrl: string;
} {
  const u = new URL(url);

  const requestUrl = u.pathname + u.search;

  return {
    query: paramsToQuery(u.searchParams),
    requestUrl,
  };
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#chaining_multiple_readablestreams_together
 */
function chainReadableStreams(rs: ReadableStream[]): ReadableStream {
  const { readable, writable } = new TransformStream();

  void rs.reduce(
    (a, res, i, arr) =>
      a.then(() =>
        res.pipeTo(writable, { preventClose: i + 1 !== arr.length }),
      ),
    Promise.resolve(),
  );

  return readable;
}

export interface PkgToResponseOptions {
  requestUrl: string | undefined;
  query: RequestQuery;
  parseFromUrl: boolean;
}

class ResponseError extends Error {
  status: number;
  body: ReadableStream<Uint8Array> | null | undefined;

  constructor({
    status = codes.INTERNAL_SERVER_ERROR,
    message,
    body,
  }: {
    status?: number;
    message: string;
    body?: ReadableStream<Uint8Array> | null;
  }) {
    super(message);

    this.status = status;
    this.body = body;
  }

  toResponse(): Response {
    const { body, message, status } = this;
    return new Response(body || message, { status });
  }
}

export async function pkg({
  /** Url path starting with "/" */
  requestUrl,
  query,
  parseFromUrl,
}: PkgToResponseOptions): Promise<[Response, Promise<unknown> | null]> {
  try {
    const pkgOpts = getDefaultParser(parseFromUrl).parse(
      requestUrl || "",
      query,
    );
    const { commitIshInfo: cii } = pkgOpts;

    const tgzUrl = getTgzUrl(cii);

    const tgzResp = await fetch(tgzUrl);

    if (!tgzResp.ok) {
      throw new ResponseError({
        message: `The response errored: ${tgzUrl}`,
        status: tgzResp.status,
        body:
          tgzResp.status === 404
            ? tgzResp.body
              ? chainReadableStreams([
                  new Blob([
                    Buffer.from(
                      `${tgzUrl} Not Found.\nThe original response body is:\n`,
                    ),
                  ]).stream(),
                  tgzResp.body,
                ])
              : new Blob([Buffer.from(`${tgzUrl} Not Found.`)]).stream()
            : tgzResp.body,
      });
    }

    const body = tgzResp.body;

    if (!body) {
      throw new ResponseError({
        message: `The response body is empty: ${tgzUrl}`,
      });
    }

    const transform = new TransformStream();
    const resp = new Response(transform.readable, {
      status: 200,
      headers: [
        [
          "Content-Disposition",
          `attachment; filename="${[
            cii.user,
            cii.repo,
            ...(cii.subdirs || []),
            cii.commit,
          ]
            .filter(Boolean)
            .join("-")}.tgz"`,
        ],
        ["Content-Type", "application/gzip"],
      ],
    });

    return [resp, downloadGitPkg(pkgOpts, body, transform.writable)];
  } catch (err) {
    {
      const errMsg = (err ? (err as Error).message : "") || "no message";
      console.error(`request ${requestUrl} failed: ${errMsg}`);
      console.error(err ? (err as Error).stack : "");
    }

    let errResp: Response;
    if (err instanceof ResponseError) {
      errResp = err.toResponse();
    } else {
      errResp = Response.json(`Failed to download: ${requestUrl}`, {
        status: codes.INTERNAL_SERVER_ERROR,
      });
    }

    return [errResp, null];
  }
}
