import type * as tar from "tar-stream";
import { StringDecoder } from "@gitpkg/edge-polyfill/string_decoder";

declare module "tar-stream" {
  interface Headers {
    pax?: {
      comment: string;
      path: string;
    };
  }
}

export interface DecodedEntry {
  headers: tar.Headers;
  content?: string;
}

export interface StreamEntry {
  headers: tar.Headers;
  stream: import("stream").Readable;
}

export type HybridEntry =
  | { kind: "tar-stream"; entry: tar.Entry }
  | { kind: "decoded"; entry: DecodedEntry }
  | { kind: "stream"; entry: StreamEntry };

export type HybridEntries = AsyncIterable<HybridEntry> | Iterable<HybridEntry>;

export function headersOfEntry(e: HybridEntry): tar.Headers {
  switch (e.kind) {
    case "tar-stream":
      return e.entry.header;
    default:
      return e.entry.headers;
  }
}

export function modifyHeadersWithNewName(
  headers: tar.Headers,
  newName: string,
): void {
  headers.name = newName;
  if (headers.pax) {
    headers.pax.path = newName;
  }
}

export function entryAsStream(
  e: HybridEntry,
): import("stream").Readable | undefined {
  switch (e.kind) {
    case "tar-stream":
      return e.entry;
    case "decoded":
      return undefined;
    case "stream":
      return e.entry.stream;
  }
}

export function resumeEntry(e: HybridEntry): void {
  entryAsStream(e)?.resume();
}

export async function* hybridEntriesFromEntries(
  entries: AsyncIterable<tar.Entry> | Iterable<tar.Entry>,
): AsyncGenerator<HybridEntry> {
  for await (const entry of entries) {
    yield { kind: "tar-stream", entry };
  }
}

export async function* hybridEntriesFromDecodedEntries(
  entries: AsyncIterable<DecodedEntry> | Iterable<DecodedEntry>,
): AsyncGenerator<HybridEntry> {
  for await (const entry of entries) {
    yield { kind: "decoded", entry };
  }
}

async function chunksToString(chunks: AsyncIterable<Buffer>): Promise<string> {
  let result = "";
  const decoder = new StringDecoder();
  for await (const chunk of chunks) {
    result += decoder.write(chunk);
  }
  return result + decoder.end();
}

export async function readEntryContent(
  e: HybridEntry,
): Promise<undefined | string> {
  switch (e.kind) {
    case "tar-stream":
      return await chunksToString(e.entry);
    case "decoded":
      return e.entry.content;
    case "stream":
      return e.entry.stream ? await chunksToString(e.entry.stream) : undefined;
  }
}

type HybridContent =
  | { kind: "stream"; content: import("stream").Readable }
  | { kind: "decoded"; content: string | undefined };

export function contentOfEntry(entry: HybridEntry): HybridContent {
  switch (entry.kind) {
    case "tar-stream":
      return { kind: "stream", content: entry.entry };
    case "decoded":
      return { kind: "decoded", content: entry.entry.content };
    case "stream":
      return { kind: "stream", content: entry.entry.stream };
  }
}
