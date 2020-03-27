import * as r from "./random";

export function repeat(
  times: r.MaybeRandomNumber,
  action: (i: number) => unknown,
) {
  const n = r.maybeRandomInt(times);

  for (let i = 0; i < n; i++) {
    action(i);
  }
}

export async function repeatAsync(
  times: r.MaybeRandomNumber,
  action: (i: number) => unknown | Promise<unknown>,
  concurrent = true,
) {
  const n = r.maybeRandomInt(times);

  if (concurrent) {
    const arr: (Promise<unknown> | unknown)[] = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = action(i);
    }

    await Promise.all(arr);
  } else {
    for (let i = 0; i < n; i++) {
      await action(i);
    }
  }
}
