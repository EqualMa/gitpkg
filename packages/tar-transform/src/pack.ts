import { Duplex, Readable } from "stream";
import * as tar from "tar-stream";
import { TarEntry } from "./types/tar-entry";
import * as zlib from "zlib";

export interface TarPackOptions {
  gzip?: boolean | zlib.ZlibOptions;
}

const TAR_PACK_PRIVATE_PROP_KEY = Symbol("tarPackPrivateProp");

interface TarPackPrivateProp {
  readable: Readable;
  pack: tar.Pack;
  setup: boolean;
}

function initTarPackReadable(
  gzipOption: TarPackOptions["gzip"],
  pack: tar.Pack,
): Readable {
  if (gzipOption) {
    const gz = zlib.createGzip(gzipOption === true ? undefined : gzipOption);
    pack.pipe(gz);
    return gz;
  } else {
    return pack;
  }
}

function initTarPackPrivateProp(options?: TarPackOptions): TarPackPrivateProp {
  const gzipOption = options && options.gzip;

  const pack = tar.pack();

  return {
    pack,
    readable: initTarPackReadable(gzipOption, pack),
    setup: false,
  };
}

type DuplexCallback = (error?: Error | null) => void;

function packEntry(pack: tar.Pack, chunk: TarEntry, callback: DuplexCallback) {
  const { headers, stream, content } = chunk;

  if (stream !== null && stream !== undefined) {
    stream.pipe(pack.entry(headers, callback));
  } else if (
    (content !== null && content !== undefined) ||
    (headers.type === "directory" && content === undefined)
  ) {
    if (stream !== null && stream !== undefined) {
      throw new Error(
        "chunk passed to TarPack.prototype._transform is invalid: both stream and content are provided",
      );
    }
    pack.entry(headers, content, callback);
  } else {
    throw new Error(
      "chunk passed to TarPack.prototype._transform is invalid: neither stream nor content is provided",
    );
  }
}

function packEntries(
  pack: tar.Pack,
  chunks: TarEntry[],
  callback: DuplexCallback,
) {
  let promise = null;
  for (const chunk of chunks) {
    const getPromise = () =>
      new Promise((resolve, reject) => {
        packEntry(pack, chunk, err => {
          if (err) reject(err);
          else resolve();
        });
      });

    if (!promise) {
      promise = getPromise();
    } else {
      promise = promise.then(getPromise);
    }
  }

  if (promise) {
    return promise
      .then(() => {
        callback();
      })
      .catch(err => {
        callback(err);
      });
  } else {
    callback();
  }
}

export class TarPack extends Duplex {
  private readonly [TAR_PACK_PRIVATE_PROP_KEY]: TarPackPrivateProp;

  constructor(options?: TarPackOptions) {
    super({ readableObjectMode: false, writableObjectMode: true });

    this[TAR_PACK_PRIVATE_PROP_KEY] = initTarPackPrivateProp(options);
  }

  _write(chunk: TarEntry, encoding: unknown, callback: DuplexCallback) {
    const { pack } = this[TAR_PACK_PRIVATE_PROP_KEY];
    packEntry(pack, chunk, callback);
  }

  _writev(
    chunks: Array<{ chunk: TarEntry; encoding: unknown }>,
    callback: DuplexCallback,
  ) {
    const { pack } = this[TAR_PACK_PRIVATE_PROP_KEY];

    packEntries(
      pack,
      chunks.map(c => c.chunk),
      callback,
    );
  }

  _read(size: number) {
    const { readable, setup } = this[TAR_PACK_PRIVATE_PROP_KEY];

    if (!setup) {
      readable
        .on("readable", () => {
          let chunk;
          while (null !== (chunk = readable.read(size))) {
            if (!this.push(chunk)) break;
          }
        })
        .on("end", () => {
          // EOF
          this.push(null);
        });

      this[TAR_PACK_PRIVATE_PROP_KEY].setup = true;
    }
  }

  _final(callback: DuplexCallback) {
    this[TAR_PACK_PRIVATE_PROP_KEY].pack.finalize();
    callback();
  }
}

export function pack(...args: ConstructorParameters<typeof TarPack>) {
  return new TarPack(...args);
}
