import * as impl from "./prepend-path";
import { tarEntries, getEntries } from "../../test/util/tar-entry";
import { Readable, pipeline as _pl } from "stream";
import { promisify } from "util";

const pipeline = promisify(_pl);

test("prepend path", () =>
  Promise.all(
    [undefined, "", "root", "root/"]
      .map(prepend =>
        ["", "d2/"].map(root => {
          const r = Readable.from(tarEntries({ root }));
          const t = impl.prependPath(prepend);

          return [
            expect(pipeline(r, t)).resolves.toBeUndefined(),
            expect(getEntries(t)).resolves.toEqual(
              [...tarEntries({ root })].map(e => ({
                ...e,
                headers: {
                  ...e.headers,
                  name: (prepend || "") + e.headers.name,
                },
              })),
            ),
          ];
        }),
      )
      .flat(2),
  ));
