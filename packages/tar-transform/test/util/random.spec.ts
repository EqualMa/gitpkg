import * as r from "./random";
import { repeat as repeatTimes } from "./repeat";
import "../matcher/size";

const repeat = repeatTimes.bind(undefined, 100);

function bufferOfLength(b: unknown, size: r.MaybeRandomNumber) {
  expect(b).toBeInstanceOf(Buffer);
  expect((b as Buffer).length).toBeIntBetween(size);
}

// #region bool
test("random bool", () => {
  repeat(() => {
    expect(typeof r.randomBool()).toBe("boolean");
  });
});
// #endregion

// #region int
test("random int", () => {
  repeat(() => {
    expect(r.randomInt(40)).toBeIntBetween({ min: 0, max: 40 });

    expect(r.randomInt(30, 6)).toBeIntBetween({ min: 6, max: 30 });
  });
});
// #endregion

// #region bytes
test("random bytes", () => {
  repeat(() => {
    {
      const size = r.randomInt(100);
      const buffer = r.randomBytesSync(size);
      bufferOfLength(buffer, size);
    }
    {
      const max = r.randomInt(100);
      const min = r.randomInt(max);
      const buffer = r.randomBytesSync({ min, max });
      bufferOfLength(buffer, { min, max });
    }
  });
});
// #endregion

// #region iterate bytes
test("random iterate bytes", () => {
  repeat(() => {
    const n = r.randomInt(30);
    const max = r.randomInt(100);
    const min = r.randomInt(max);

    for (const size of [max, { max, min }, { max }]) {
      let i = 0;
      for (const buffer of r.iterRandomBytesSync(n, size)) {
        bufferOfLength(buffer, size);
        i++;
      }
      expect(i).toBe(n);
    }
  });
});
// #endregion

// #region string
test("random string", () => {
  const emptyStr = r.randomStringSync(0);
  expect(typeof emptyStr).toBe("string");
  expect(emptyStr).toHaveLength(0);

  repeat(() => {
    const max = r.randomInt(100);
    const min = r.randomInt(max);

    for (const len of [max, { max, min }, { max }]) {
      const str = r.randomStringSync(len);
      expect(typeof str).toBe("string");
      expect(str.length).toBeIntBetween(len);
    }
  });
});
// #endregion
