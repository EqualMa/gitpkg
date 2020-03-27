export interface PkgCustomScript {
  name: string;
  script: string;
  type: "prepend" | "append" | "replace";
}

const SCRIPTS_PREFIX = "scripts.";

export function queryKeyIsCustomScript(
  key: string | symbol | number,
): key is string {
  return typeof key === "string" && key.startsWith(SCRIPTS_PREFIX);
}

function trimAndAnd(v: string) {
  return v
    .slice(v.startsWith("&&") ? 2 : 0, v.endsWith("&&") ? -2 : undefined)
    .trim();
}

export function parseQueryAsCustomScript(
  key: string,
  value: string | string[],
): PkgCustomScript {
  if (!queryKeyIsCustomScript(key)) {
    throw new Error("query key is not valid as a custom script");
  }

  let type: PkgCustomScript["type"] | undefined = undefined;
  let script: string;

  const name = key.slice(SCRIPTS_PREFIX.length);

  if (typeof value === "string") {
    const v = value.trim();
    type = v.startsWith("&&")
      ? "append"
      : v.endsWith("&&")
      ? "prepend"
      : "replace";
    script = trimAndAnd(v);
  } else {
    const s = [];
    for (const [i, val] of value.entries()) {
      const v = val.trim();
      if (i === 0 && v.startsWith("&&")) {
        type = "append";
      } else if (i === value.length - 1 && v.endsWith("&&")) {
        type = "prepend";
      }

      s.push(trimAndAnd(v));
    }
    script = s.join(" && ");
  }

  return {
    name,
    script,
    type: type === undefined ? "replace" : type,
  };
}
