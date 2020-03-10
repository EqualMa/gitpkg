import * as r from "../util/random";

expect.extend({
  toBeInt(v) {
    const pass = Number.isInteger(v);
    return {
      message: () => `expect ${v} ${pass ? "not " : ""}to be an integer`,
      pass,
    };
  },
  toBeIntBetween(v, n: r.MaybeRandomNumber) {
    const pass =
      Number.isInteger(v) &&
      (typeof n === "number"
        ? v === n
        : (n.max === (n.min || 0) ? v === n.max : v < n.max) &&
          v >= (n.min || 0));

    const predicate =
      typeof n === "number" || n.max === (n.min || 0)
        ? `equal to ${typeof n === "number" ? n : n.max}`
        : `between [${n.min || 0}, ${n.max}]`;

    return {
      message: () =>
        `expect ${v} ${pass ? "not " : ""}to be an integer ` + predicate,
      pass,
    };
  },
});
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInt(): R;
      toBeIntBetween(n: r.MaybeRandomNumber): R;
    }
  }
}
