import * as crypto from "crypto";

export function randomBool(): boolean {
  return Math.random() < 0.5;
}

/**
 * @returns an integer in [ min , max )
 */
export function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function maybeRandomInt(n: MaybeRandomNumber): number {
  return typeof n === "number" ? n : randomInt(n.max, n.min);
}

export type MaybeRandomNumber =
  | number
  | {
      max: number;
      /** @default 0 */
      min?: number;
    };

export function randomBytesSync(size: MaybeRandomNumber) {
  return crypto.randomBytes(maybeRandomInt(size));
}

export function* iterRandomBytesSync(len: number, size: MaybeRandomNumber) {
  for (let i = 0; i < len; i++) {
    yield randomBytesSync(size);
  }
}

export function randomBytes(size: MaybeRandomNumber): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(maybeRandomInt(size), (err, buf) => {
      if (err) reject(err);
      else resolve(buf);
    });
  });
}

export async function* iterRandomBytes(len: number, size: MaybeRandomNumber) {
  for (let i = 0; i < len; i++) {
    yield await randomBytes(size);
  }
}

export const STRING_NORMALIZE = "NFC";

const MAX_CODE_POINT = 0xd800;

export function randomStringSync(length: MaybeRandomNumber): string {
  if (length === 0) {
    return "";
  }

  const len = maybeRandomInt(length);

  const codes = new Uint16Array(len);

  crypto.randomFillSync(codes);

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    if (code >= MAX_CODE_POINT) {
      codes[i] = code % MAX_CODE_POINT;
    }
  }

  let str = String.fromCharCode(...codes).normalize(STRING_NORMALIZE);

  while (str.length !== len) {
    if (str.length < len) {
      str += randomStringSync(len - str.length);
      str = str.normalize(STRING_NORMALIZE);
    }
    if (str.length > len) {
      str = str.slice(0, len).normalize(STRING_NORMALIZE);
    }
  }

  return str;
}

function randomFill<T extends NodeJS.ArrayBufferView>(buffer: T): Promise<T> {
  return new Promise((resolve, reject) => {
    crypto.randomFill(buffer, (err, buf) => {
      if (err) reject(err);
      else resolve(buf);
    });
  });
}

export async function randomString(length: MaybeRandomNumber): Promise<string> {
  if (length === 0) {
    return "";
  }

  const len = maybeRandomInt(length);

  const codes = new Uint16Array(len);

  await randomFill(codes);

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    if (code >= MAX_CODE_POINT) {
      codes[i] = code % MAX_CODE_POINT;
    }
  }

  let str = String.fromCharCode(...codes).normalize(STRING_NORMALIZE);

  while (str.length !== len) {
    if (str.length < len) {
      str += await randomString(len - str.length);
      str = str.normalize(STRING_NORMALIZE);
    }
    if (str.length > len) {
      str = str.slice(0, len).normalize(STRING_NORMALIZE);
    }
  }

  return str;
}
