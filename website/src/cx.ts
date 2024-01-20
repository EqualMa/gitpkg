/** The type is unknown so that any value can be used as a predicate */
type Predicate = unknown;

type ClassNameValue =
  | ClassNameValue[]
  | { [className: string]: Predicate }
  | string
  | false
  | null
  | undefined
  | 0;

function joinTwoClasses(a: string | undefined, b: string | undefined): string {
  return a
    ? b
      ? //
        a.endsWith(" ")
        ? a + b
        : `${a} ${b}`
      : a
    : b || "";
}

function toVal(mix: ClassNameValue): string | undefined {
  if (typeof mix === "string") {
    return mix;
  } else if (!mix) {
    return undefined;
  } else if (typeof mix === "object") {
    if (!Array.isArray(mix)) {
      mix = Object.entries(mix)
        .map(([className, predicate]) => (predicate ? className : ""))
        .filter(Boolean);
    }

    const lastIndex = mix.length - 1;
    return mix
      .map(toVal)
      .map((v, i) => {
        if (!v) return "";

        if (i < lastIndex && !v.endsWith(" ")) {
          v = `${v} `;
        }

        return v;
      })
      .join("");
  }
}

export default function cx(
  strings: TemplateStringsArray,
  ...names: ClassNameValue[]
): string {
  const len = names.length;
  return strings
    .map((className, i) => {
      if (i < len) {
        const appendName = names[i];

        className = joinTwoClasses(className, toVal(appendName));
        if (className && !className.endsWith(" ")) {
          className = `${className} `;
        }
      }

      return className;
    })
    .join("");
}
