import { HTTPError } from "got";

export interface HttpErrorInfo {
  code: number;
  message: string;
}

export function extractInfoFromHttpError(
  err: unknown,
  defaults: HttpErrorInfo,
) {
  if (err instanceof HTTPError) {
    const code =
      (err.code && parseInt(err.code)) ||
      err.response.statusCode ||
      defaults.code;
    const message = err.message;
    return { code, message };
  } else return defaults;
}
