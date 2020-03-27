import * as tar from "tar-stream";
import { Duplex, Writable } from "stream";
import { drain } from "./util/drain";
import { TarEntryWithStream } from "./types/tar-entry";

export type TarExtractGzipOption =
  | boolean
  | "auto"
  | import("zlib").ZlibOptions;

export interface TarExtractOptions {
  gzip?: TarExtractGzipOption;
}

const TAR_EXTRACT_PRIVATE_PROP_KEY = Symbol("tarPackPrivateProp");

function getGzipOption(
  options: TarExtractOptions | undefined,
): TarExtractGzipOption {
  if (!options || options.gzip === undefined) {
    return "auto";
  }

  const { gzip } = options;
  if (
    typeof gzip === "boolean" ||
    gzip === "auto" ||
    (typeof gzip === "object" && gzip !== null)
  ) {
    return gzip;
  }

  throw new Error("TarExtract constructor option gzip is wrong");
}

type TarExtractPrivateTarExtract = {
  extract: tar.Extract;
  setup: boolean;
} & (
  | {
      writable: Writable;
      pending: undefined;
    }
  | {
      writable: undefined;
      pending: Promise<Writable>;
    }
);

function getPrivateTarExtract(
  options: TarExtractOptions | undefined,
): TarExtractPrivateTarExtract {
  const gzip = getGzipOption(options);

  const extract = tar.extract();

  const writableStreamPromise: Promise<import("stream").Duplex> | undefined =
    gzip === true || typeof gzip === "object"
      ? import("zlib").then(zlib =>
          zlib.createGunzip(gzip === true ? undefined : gzip),
        )
      : gzip === false
      ? undefined
      : import("./util/gunzip-maybe").then(({ default: gunzip }) => gunzip());

  const tarExtract: TarExtractPrivateTarExtract = writableStreamPromise
    ? {
        extract,
        setup: false,
        writable: undefined,
        pending: writableStreamPromise.then(w => {
          w.pipe(extract);
          tarExtract.writable = w;
          tarExtract.pending = undefined;

          return w;
        }),
      }
    : {
        extract,
        setup: false,
        writable: extract,
        pending: undefined,
      };

  return tarExtract;
}

type DuplexCallback = (error?: Error | null) => void;

export class TarExtract extends Duplex {
  protected readonly [TAR_EXTRACT_PRIVATE_PROP_KEY]: TarExtractPrivateTarExtract;

  constructor(options?: TarExtractOptions) {
    super({ ...options, readableObjectMode: true, writableObjectMode: false });

    this[TAR_EXTRACT_PRIVATE_PROP_KEY] = getPrivateTarExtract(options);
  }

  async _write(chunk: Uint8Array, encoding: unknown, callback: DuplexCallback) {
    try {
      const { writable, pending } = this[TAR_EXTRACT_PRIVATE_PROP_KEY];
      const writer = writable || (await pending);
      if (!writer) {
        throw new Error("invalid state in TarExtract: writer is unavailable");
      }

      let resolve: () => void;
      let reject: (err: Error) => void;
      const p = new Promise((rsv, rjt) => {
        resolve = rsv;
        reject = rjt;
      });

      if (
        !writer.write(chunk, err => {
          if (err) reject(err);
          else resolve();
        })
      ) {
        await drain(writer);
      }

      await p;
      callback();
    } catch (err) {
      callback(err);
    }
  }

  _read() {
    const { setup, extract } = this[TAR_EXTRACT_PRIVATE_PROP_KEY];

    if (!setup) {
      this[TAR_EXTRACT_PRIVATE_PROP_KEY].setup = true;

      extract.on("entry", (headers, stream, next) => {
        const res: TarEntryWithStream = { headers, stream };

        this.push(res);

        // stream.once("end", () => {
        //   console.log("stream once [end]");
        //   next();
        // });
        next();
      });
      extract.on("finish", () => {
        this.push(null);
      });
    }
  }

  async _final(callback: DuplexCallback) {
    const { writable, pending } = this[TAR_EXTRACT_PRIVATE_PROP_KEY];
    const writer = writable || (await pending);
    if (!writer) {
      throw new Error("invalid state in TarExtract: writer is unavailable");
    }
    writer.end(callback);
  }
}

export function extract(...args: ConstructorParameters<typeof TarExtract>) {
  return new TarExtract(...args);
}
