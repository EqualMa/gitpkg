export class UrlInvalidError extends Error {
  constructor(msg?: string) {
    super(msg);
  }
}

export class QueryParamsInvalidError extends Error {
  constructor(public readonly key: string | string[], msg?: string) {
    super(msg);
  }
}
