import * as cg from "./compare-iterable";
import * as r from "./random";

function* range(n: number) {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

function delay(t: number) {
  return new Promise(resolve => setTimeout(resolve, t));
}

async function* delayed<T>(t: r.MaybeRandomNumber, gen: Iterable<T>) {
  for (const v of gen) {
    const time = r.maybeRandomInt(t);
    await delay(time);
    yield v;
  }
}

test("compare identical non-async iterables", () => {
  expect(
    cg.iterablesAreIdentical({ iterables: [range(10), range(10)] }),
  ).resolves.toBe(true);

  expect(
    cg.iterablesAreIdentical({ iterables: [range(9), range(10)] }),
  ).resolves.toBe(false);
});

test("compare identical (async) iterables", () => {
  expect(
    cg.iterablesAreIdentical({
      iterables: [delayed(10, range(10)), delayed(10, range(10))],
    }),
  ).resolves.toBe(true);

  expect(
    cg.iterablesAreIdentical({
      iterables: [
        delayed({ min: 1, max: 10 }, range(10)),
        delayed({ min: 5, max: 15 }, range(9)),
      ],
    }),
  ).resolves.toBe(false);
});

test("check if iterables are same set", () => {
  expect(
    cg.iterablesAreSameSet({
      iterables: [
        [1, 2, 3, 4],
        [1, 3, 4, 2],
      ],
    }),
  ).resolves.toBe(true);

  expect(
    cg.iterablesAreSameSet({
      iterables: [delayed({ min: 1, max: 10 }, [1, 2, 3, 4]), [1, 3, 4, 2]],
    }),
  ).resolves.toBe(true);
});
