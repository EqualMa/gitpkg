import * as stream from "@gitpkg/edge-polyfill/stream";
import * as pkg from "@gitpkg/core/api/download-git-pkg";

export const config = {
  runtime: "edge",
};

export default (request: Request) => {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "World";
  return Response.json({
    msg: `Hello ${name} at timestamp ${new Date().getTime()}`,
    query: [...url.searchParams],
    url: request.url,
    modules: { stream, pkg },
  });
};
