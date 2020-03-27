import * as r from "./random";

export async function randomFileContent(
  size: r.MaybeRandomNumber,
  type: "string" | "bin" = "bin",
): Promise<string | Buffer> {
  if (type === "string") {
    return r.randomString(size);
  } else {
    return r.randomBytes(size);
  }
}

// eslint-disable-next-line no-control-regex
export const REGEXP_FILE_NAME_ESCAPE = /[\x00-\x1F\x7F"*/:<>?\\|]/g;

export async function randomFileName(len: r.MaybeRandomNumber) {
  REGEXP_FILE_NAME_ESCAPE.lastIndex = 0;
  const str = await r.randomString(len);
  if (str === "." || str === "..") return "_";
  return str.replace(REGEXP_FILE_NAME_ESCAPE, "_");
}

export interface VirtualNormalFile {
  type: "file";
  name: string;
  content: Buffer | string;
}

export interface VirtualDirectory {
  type: "dir";
  name: string;
  files: VirtualFile[];
}

export type VirtualFile = VirtualNormalFile | VirtualDirectory;

export interface RandomFilesOptions {
  fileSize?: r.MaybeRandomNumber;
  /** file count in each dir */
  fileCount?: r.MaybeRandomNumber;
  fileNameLength?: r.MaybeRandomNumber;
  depth?: r.MaybeRandomNumber;
  content?: "random" | "bin" | "string";
  baseDir?: string;
  onlyFile?: boolean | "file-and-empty-dir";
}

function normalizeRandomFilesOptions({
  fileSize = { min: 0, max: 100 },
  fileCount = { min: 0, max: 5 },
  fileNameLength = { min: 1, max: 10 },
  depth = { min: 1, max: 4 },
  content = "random",
  baseDir = "",
  onlyFile = false,
}: RandomFilesOptions = {}): Required<RandomFilesOptions> {
  return {
    fileSize,
    fileCount,
    fileNameLength,
    depth,
    content,
    baseDir,
    onlyFile,
  };
}

export async function randomFiles(
  options?: RandomFilesOptions,
): Promise<VirtualFile[]> {
  const {
    fileSize,
    fileCount,
    fileNameLength,
    depth,
    content,
  } = normalizeRandomFilesOptions(options);
  const d = r.maybeRandomInt(depth);

  const count = r.maybeRandomInt(fileCount);

  const files: VirtualFile[] = [];
  const usedFileNames: Record<string, boolean> = {};

  let i = 0;
  while (i < count) {
    const isDir = r.randomBool();

    const name = await randomFileName(fileNameLength);
    if (name.length === 0 || usedFileNames[name]) {
      continue;
    }
    usedFileNames[name] = true;
    i++;

    if (isDir) {
      files.push({
        type: "dir",
        name,
        files:
          d === 0
            ? []
            : await randomFiles({
                content,
                fileCount,
                fileSize,
                depth: d - 1,
              }),
      });
    } else {
      const c =
        content === "random" ? (r.randomBool() ? "bin" : "string") : content;
      files.push({
        type: "file",
        name,
        content: await randomFileContent(fileSize, c),
      });
    }
  }

  return files;
}

function joinPath(baseDir: string, path: string) {
  if (baseDir === "") return path;
  const e = baseDir.endsWith("/");
  if (e !== path.startsWith("/")) {
    return baseDir + path;
  } else {
    return baseDir + (e ? path.slice(1) : "/" + path);
  }
}

export interface VirtualPath {
  path: string;
  file: VirtualFile;
}

export async function* iterFiles(
  files: AsyncIterable<VirtualFile> | Iterable<VirtualFile>,
  baseDir = "",
  { onlyFile = false }: { onlyFile?: boolean | "file-and-empty-dir" } = {},
): AsyncGenerator<VirtualPath> {
  for await (const f of files) {
    const path = joinPath(baseDir, f.name);

    if (f.type === "dir") {
      const empty = f.files.length === 0;
      if (onlyFile === false || (onlyFile === "file-and-empty-dir" && empty)) {
        yield { path, file: f };
      }
      if (!empty) {
        yield* iterFiles(f.files, path, { onlyFile });
      }
    } else if (f.type === "file") {
      yield { path, file: f };
    } else {
      throw new Error(
        "not supported file type: " + ((f as unknown) as VirtualFile).type,
      );
    }
  }
}

export async function* iterRandomFiles(
  options?: RandomFilesOptions,
): AsyncGenerator<VirtualPath> {
  const opts = normalizeRandomFilesOptions(options);
  const {
    fileSize,
    fileCount,
    fileNameLength,
    depth,
    content,
    baseDir,
    onlyFile,
  } = opts;

  const d = r.maybeRandomInt(depth);
  const count = r.maybeRandomInt(fileCount);

  const usedFileNames: Record<string, boolean> = {};

  let i = 0;
  while (i < count) {
    const isDir = r.randomBool();

    const name = await randomFileName(fileNameLength);
    if (name.length === 0 || usedFileNames[name]) {
      continue;
    }

    const path = joinPath(baseDir, name);
    usedFileNames[name] = true;
    i++;

    if (isDir) {
      const subFiles: VirtualFile[] = [];

      const subFilesCount = r.maybeRandomInt(fileCount);

      const empty = d === 0 || subFilesCount === 0;

      const dir: VirtualDirectory = {
        type: "dir",
        name,
        files: subFiles,
      };

      if (onlyFile === false || (onlyFile === "file-and-empty-dir" && empty)) {
        yield { path, file: dir };
      }

      if (!empty) {
        for await (const subPath of iterRandomFiles({
          ...opts,
          fileCount: subFilesCount,
          depth: d - 1,
          baseDir: path,
        })) {
          subFiles.push(subPath.file);
          yield subPath;
        }
      }
    } else {
      const c =
        content === "random" ? (r.randomBool() ? "bin" : "string") : content;
      const fileContent = await randomFileContent(fileSize, c);
      const vf: VirtualNormalFile = {
        type: "file",
        name,
        content: fileContent,
      };
      yield {
        file: vf,
        path,
      };
    }
  }
}
