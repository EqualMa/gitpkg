import { parseUrl, pkg } from "./_utils/pkg.js";

export const config = {
  runtime: "edge",
};

export default async (request: Request) => {
  const [resp, _pro] = await pkg({
    ...parseUrl(request.url),
    parseFromUrl: false,
  });

  return resp;
};
