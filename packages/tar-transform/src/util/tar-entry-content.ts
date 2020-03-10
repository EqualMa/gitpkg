import { TarEntry } from "../types/tar-entry";
import { streamToBuffer } from "./stream-to";

export async function bufferContentOfTarEntry(
  entry: TarEntry,
): Promise<Buffer> {
  const { content, stream } = entry;
  if (typeof content === "string" && !stream) {
    return Buffer.from(content);
  } else if (content instanceof Buffer && !stream) {
    return content;
  } else if (!!stream && !content) {
    return streamToBuffer(stream);
  } else {
    throw new Error("invalid content of TarEntry");
  }
}
export async function stringContentOfTarEntry(
  entry: TarEntry,
  encoding?: string,
): Promise<string> {
  const { content, stream } = entry;
  if (typeof content === "string") {
    if (stream) {
      throw new Error("invalid content of TarEntry");
    }
    return content;
  } else {
    const buf = await bufferContentOfTarEntry(entry);
    return buf.toString(encoding);
  }
}
