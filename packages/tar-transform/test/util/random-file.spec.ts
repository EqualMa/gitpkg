import * as rf from "./random-file";
import * as r from "./random";
import { repeatAsync as _ra } from "./repeat";
import "../matcher/size";

const repeatAsync = _ra.bind(undefined, 100);

test("random file name", () =>
  repeatAsync(async () => {
    const max = r.randomInt(100, 1);
    const min = r.randomInt(max, 1);

    for (const len of [max, { max }, { min, max }]) {
      const name = await rf.randomFileName(len);
      expect(typeof name).toBe("string");
      expect(name.length).toBeIntBetween(len);
      rf.REGEXP_FILE_NAME_ESCAPE.lastIndex = 0;
      expect(rf.REGEXP_FILE_NAME_ESCAPE.exec(name)).toBe(null);
    }
  }));

test("random file content", () =>
  Promise.all([
    repeatAsync(async () => {
      expect(await rf.randomFileContent(0, "string")).toBe("");
      {
        const bin = await rf.randomFileContent(0, "bin");
        expect(bin).toBeInstanceOf(Buffer);
        expect(bin).toHaveLength(0);
      }
    }),
    repeatAsync(async () => {
      const max = r.randomInt(100, 1);
      const min = r.randomInt(max, 1);

      for (const type of ["bin", "string"] as const) {
        for (const len of [max, { max }, { min, max }]) {
          const content = await rf.randomFileContent(len, type);
          if (type === "bin") {
            expect(content).toBeInstanceOf(Buffer);
          } else {
            expect(typeof content).toBe("string");
          }
          expect(content.length).toBeIntBetween(len);
        }
      }
    }),
  ]));
