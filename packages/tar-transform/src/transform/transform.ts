import { Transform, TransformCallback } from "stream";
import { TarEntry } from "../types/tar-entry";

import { TarEntryTransformer, TransformerOptions } from "./transformer";
export * from "../util/stream-to";

const KEY_TRANSFORMER = Symbol("transformer");

export class TarTransform<T = never> extends Transform {
  private [KEY_TRANSFORMER]: TarEntryTransformer<T> | undefined;

  constructor(transformer?: TransformerOptions<T> | TarEntryTransformer<T>) {
    super({ readableObjectMode: true, writableObjectMode: true });

    if (transformer) {
      const t =
        transformer instanceof TarEntryTransformer
          ? transformer
          : new TarEntryTransformer(transformer);
      t.readableStream = this;
      this[KEY_TRANSFORMER] = t;
    } else {
      this[KEY_TRANSFORMER] = undefined;
    }
  }

  protected get transformer(): TarEntryTransformer<T> {
    const v = this[KEY_TRANSFORMER];
    if (!v)
      throw new Error("transformer of instance of TarTransform not assigned");

    return v;
  }

  _transform(chunk: TarEntry, encoding: unknown, callback: TransformCallback) {
    const t = this.transformer;
    Promise.resolve(t.onEntry(chunk))
      .then(() => {
        callback();
      })
      .catch(err => callback(err));
  }

  _flush(callback: TransformCallback) {
    Promise.resolve(this.transformer.onEnd()).then(() => callback());
  }

  protected transformTarEntry(chunk: TarEntry): void | Promise<void> {
    this.push(chunk);
  }
}

export function transform<T = never>(
  transformer: TransformerOptions<T>,
): TarTransform<T>;
export function transform<T = never>(
  transformer: TarEntryTransformer<T>,
): TarTransform<T>;
export function transform<T = never>(
  transformer: TransformerOptions<T> | TarEntryTransformer<T>,
): TarTransform<T> {
  return new TarTransform(transformer);
}
