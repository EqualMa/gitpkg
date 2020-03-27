import { NowRequest, NowResponse } from "@now/node";

export default (request: NowRequest, response: NowResponse) => {
  const { name = "World" } = request.query;
  response.status(200).json({
    msg: `Hello ${name} at timestamp ${new Date().getTime()}`,
    query: request.query,
    url: request.url,
  });
};
