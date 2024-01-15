import { NowRequest, NowResponse } from "@now/node";
import { pkg } from "./_utils/pkg.js";

export default async (request: NowRequest, response: NowResponse) => {
  await pkg({
    query: request.query,
    requestUrl: request.url,
    parseFromUrl: true,
    response,
  });
};
