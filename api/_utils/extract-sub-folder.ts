import * as tar from "tar-stream";

function processHeader(
  header: tar.Headers,
  root: string | undefined,
  subdir: string,
):
  | undefined
  | { action: "set-root"; data: string }
  | { action: "pipe"; data: tar.Headers } {
  const { name } = header;
  if (root === undefined) {
    return { action: "set-root", data: name };
  } else if (name.startsWith(root)) {
    const dir = root + subdir;
    if (name.startsWith(dir) && name.length > dir.length) {
      header.name = name.slice(dir.length);
      return { action: "pipe", data: header };
    } else {
      return undefined;
    }
  } else {
    throw new Error("source file is not valid");
  }
}

/**
 *
 * @param subdir should be "" or end with "/"
 */
export function subFolderStreamOfTar(subdir: string) {
  const extract = tar.extract();
  const pack = tar.pack();

  let root: undefined | string = undefined;
  extract.on("entry", (header, stream, next): true => {
    try {
      const res = processHeader(header, root, subdir);
      if (res !== undefined && res.action === "pipe") {
        stream.pipe(pack.entry(header, next));
        return true;
      } else {
        if (res && res.action === "set-root") {
          root = res.data;
        }

        stream.on("end", () => {
          next();
        });
        // just auto drain the stream
        stream.resume();
        return true;
      }
    } catch (err) {
      extract.destroy(err);
      pack.destroy(err);
      return true;
    }
  });

  extract.on("finish", function() {
    // all entries done - finalize it
    pack.finalize();
  });

  return { extract, pack };
}
