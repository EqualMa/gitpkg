import { Locker } from "./lock";

export async function reduceAsyncIterables<
  CHUNKS extends unknown[],
  CTX,
  E = boolean
>({
  iterables,
  context,
  onNew,
  done,
}: {
  iterables: (AsyncIterable<CHUNKS[number]> | Iterable<CHUNKS[number]>)[];
  context: CTX;
  onNew: <IDX extends number>(
    id: number,
    item: CHUNKS[IDX],
    index: number,
    context: CTX,
  ) => void | boolean | Promise<void | boolean>;
  done: (context: CTX) => E | Promise<E>;
}): Promise<E> {
  await Promise.all(
    iterables.map(async (iter, idx) => {
      let i = 0;
      for await (const item of iter) {
        if ((await onNew(idx, item, i, context)) === false) {
          break;
        }
        i++;
      }
    }),
  );

  return done(context);
}

const strictEquals = <T>(a: T, b: T) => a === b;

export function iterablesAreIdentical<T>({
  iterables,
  compare = strictEquals,
}: {
  iterables: (AsyncIterable<T> | Iterable<T>)[];
  compare?: (
    a: T,
    b: T,
    idx1: number,
    idx2: number,
  ) => boolean | Promise<boolean>;
}): Promise<boolean> {
  let identical = true;
  const context: T[] = [];
  const len = new Map<number, number>();
  return reduceAsyncIterables<T[], typeof context, boolean>({
    iterables,
    context,
    async onNew(idx, item, i, context) {
      // these iterables have been known as not identical previously
      if (identical === false) return false;

      len.set(idx, (len.get(idx) || 0) + 1);

      if (i < context.length) {
        if (!(await compare(context[i], item, i, idx))) {
          identical = false;
          return false;
        }
      } else if (i === context.length) {
        context.push(item);
      } else {
        throw new Error("invalid state in iterablesAreIdentical");
      }
    },
    done() {
      if (!identical) return false;

      let length: number | undefined = undefined;

      for (const v of len.values()) {
        if (length === undefined) length = v;
        if (v !== length) return false;
      }

      return context.length === length;
    },
  });
}

export function iterablesAreSameSet<T>({
  iterables,
  compare = strictEquals,
}: {
  iterables: (AsyncIterable<T> | Iterable<T>)[];
  compare?: (
    a: T,
    b: T,
    idx1: number,
    idx2: number,
  ) => boolean | Promise<boolean>;
}): Promise<boolean> {
  const context: { data: T; matched: number[] }[] = [];

  const n = iterables.length;

  const contextLocker = new Locker();

  return reduceAsyncIterables<T[], typeof context, boolean>({
    iterables,
    context,
    async onNew(idx, item, i, context) {
      const unlock = await contextLocker.lock();
      let found: typeof context[number] | undefined = undefined;
      for (const ctx of context) {
        if (
          ctx.matched.every(matchedIdx => matchedIdx !== idx) &&
          (await compare(ctx.data, item, ctx.matched[0], idx))
        ) {
          found = ctx;
        }
      }

      if (found) {
        found.matched.push(idx);
      } else {
        context.push({ data: item, matched: [idx] });
      }

      unlock();
    },
    done() {
      return context.every(ctx => {
        const sorted = [...ctx.matched].sort();
        return sorted.length === n && sorted.every((idx, i) => idx === i);
      });
    },
  });
}
