import { NowRequest, NowResponse } from "@now/node";
import { pkg } from "./_utils/pkg";

export default async (request: NowRequest, response: NowResponse) => {
  const requestUrl = request.url;

  await pkg({
    query: request.query,
    requestUrl,
    response,
  });
};
