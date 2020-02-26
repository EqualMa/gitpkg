import { NowRequest, NowResponse } from "@now/node";
import { pkg } from "./_utils/pkg";
import { extractQueryFromUrl } from "./_utils/request-query";
import * as codes from "./_http_status_code";

export default async (request: NowRequest, response: NowResponse) => {
  const requestUrl = request.url;

  const query = extractQueryFromUrl(requestUrl);

  if (!query) {
    response.status(codes.BAD_REQUEST).json("request with invalid url");
    return;
  }

  console.log(query);
  await pkg({
    query,
    requestUrl,
    response,
  });
};
