import { TarEntryHeaders } from "../util/tar-entry-headers";

interface TarEntryBase {
  readonly headers: TarEntryHeaders;
}

export interface TarEntryWithStream extends TarEntryBase {
  readonly stream: import("stream").Readable;
  readonly content?: undefined;
}

export interface TarEntryWithContent extends TarEntryBase {
  readonly stream?: undefined;
  readonly content?: string | Buffer;
}

export type TarEntry = TarEntryWithStream | TarEntryWithContent;

export function isTarEntry(e: unknown): e is TarEntry {
  if (typeof e === "object" && e && "headers" in e) {
    const { headers, content, stream } = e as TarEntry;
    if (
      headers &&
      typeof headers === "object" &&
      typeof headers.name === "string"
    ) {
      if (headers.pax && headers.name !== headers.pax.path) {
        return false;
      }

      return (
        // only content
        ((typeof content === "string" || content instanceof Buffer) &&
          !stream) ||
        // only stream
        (!!stream && !content) ||
        // directory
        (!stream && !content && headers.type === "directory")
      );
    }
  }

  return false;
}
