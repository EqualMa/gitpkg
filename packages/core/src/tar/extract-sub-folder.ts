import * as tar from "tar-transform";

/**
 *
 * @param subFolder should be "" or end with "/"
 * @param prepend should be "" or end with "/"
 */
export const extractSubFolder = (subFolder: string, prepend = "") =>
  tar.transform<{ root: undefined | string }>({
    onEntry(entry): true {
      const ctx = this.ctx;
      const {
        headers,
        headers: { name },
      } = entry;
      if (ctx.root === undefined) {
        if (entry.headers.type !== "directory") {
          throw new Error("invalid source file: first entry is not directory");
        }
        ctx.root = name;
        return this.pass(entry);
      } else if (name.startsWith(ctx.root)) {
        if (headers.pax && headers.pax.path !== name) {
          throw new Error(
            "source file is not valid due to tarball pax header mismatch",
          );
        }

        const dir = ctx.root + subFolder;
        if (name.startsWith(dir) && name.length > dir.length) {
          const newHeaders = this.util.headersWithNewName(
            headers,
            prepend + name.slice(dir.length),
          );

          return this.push({ ...entry, headers: newHeaders });
        } else return this.pass(entry);
      } else {
        throw new Error("invalid source file: multiple dirs in root");
      }
    },
    initCtx: { root: undefined },
  });
