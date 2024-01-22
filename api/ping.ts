import * as stream from "../packages/edge-polyfill/src/stream.js";

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
    modules: { stream },
  });
};
