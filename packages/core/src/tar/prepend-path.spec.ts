import * as impl from "./prepend-path.js";
import {
  tarEntriesPackAndExtract,
  decodeAndCollectEntries,
  packAndExtract,
  tarEntries,
  decodeAndCollectHybridEntries,
} from "../../test/util/tar-entry.js";
import { hybridEntriesFromEntries } from "./entry.js";

test("prepend path", () =>
  Promise.all(
    [undefined, "", "root", "root/"]
      .map(prepend =>
        ["", "d2/"].map(async root => {
          const t = impl.prependPathOfEntries(
            hybridEntriesFromEntries(tarEntriesPackAndExtract({ root })),
            prepend,
          );

          const res = await decodeAndCollectHybridEntries(t);

          const expected = await decodeAndCollectEntries(
            packAndExtract(
              [...tarEntries({ root })].map(e => ({
                ...e,
                headers: {
                  ...e.headers,
                  name: (prepend || "") + e.headers.name,
                },
              })),
            ),
          );

          expect(res).toEqual(expected);
        }),
      )
      .flat(1) satisfies Promise<void>[],
  ));
