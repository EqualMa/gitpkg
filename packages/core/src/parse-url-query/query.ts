export type RequestQuery = {
  [K in string]?: string | string[];
};

export function paramsToQuery(params: URLSearchParams): RequestQuery {
  const res: RequestQuery = {};

  for (const [name, value] of params) {
    const oldValue: string | string[] | undefined = res[name];
    if (typeof oldValue === "string") {
      res[name] = [oldValue, value];
    } else if (Array.isArray(oldValue)) {
      oldValue.push(value);
    } else {
      res[name] = value;
    }
  }

  return res;
}
