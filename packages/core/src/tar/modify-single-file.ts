import { transform, TarEntry, TarEntryTransformer } from "tar-transform";

type MaybePromise<T> = T | Promise<T>;

export const modifySingleFile = (
  filePath: string,
  modify: (
    this: TarEntryTransformer<{ matched: boolean }>,
    entry: TarEntry,
  ) => MaybePromise<
    { content: string } | { stream: import("stream").Readable }
  >,
) =>
  transform({
    async onEntry(entry): Promise<true> {
      if (entry.headers.name === filePath) {
        if (this.ctx.matched) {
          throw new Error(`invalid state`);
        }
        this.ctx.matched = true;
        const data = await modify.call(this, entry);
        return this.push({
          headers: entry.headers,
          ...data,
        });
      } else {
        return this.push(entry);
      }
    },
    onEnd() {
      if (!this.ctx.matched) {
        throw new Error(`file not found: ${filePath}`);
      }
    },
    initCtx: {
      matched: false,
    },
  });
