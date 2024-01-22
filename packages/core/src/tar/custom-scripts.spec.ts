import * as impl from "./custom-scripts.js";
import { PkgCustomScript } from "../parse-url-query/index.js";
import {
  decodeAndCollectHybridEntries,
  tarEntries,
} from "../../test/util/tar-entry.js";
import { DecodedEntry, hybridEntriesFromDecodedEntries } from "./entry.js";

const ADD_TYPES: PkgCustomScript["type"][] = ["append", "prepend", "replace"];

type TestCase = [
  Record<string, string>,
  PkgCustomScript[],
  Record<string, string>,
];

const testCases = (): TestCase[] => [
  [{}, [], {}],
  ...ADD_TYPES.map<TestCase>(type => [
    {},
    [{ name: "build", script: "tsc", type }],
    { build: "tsc" },
  ]),
  ...ADD_TYPES.map<TestCase>(type => {
    const res = {
      append: "tsc && echo 'success'",
      prepend: "echo 'success' && tsc",
      replace: "echo 'success'",
    };
    return [
      { build: "tsc" },
      [{ name: "build", script: "echo 'success'", type }],
      { build: res[type] },
    ];
  }),
  ...ADD_TYPES.map<TestCase>(type => {
    const res = {
      append: "tsc && echo 'success'",
      prepend: "echo 'success' && tsc",
      replace: "echo 'success'",
    };
    return [
      { build: "tsc", test: "jest" },
      [
        { name: "build", script: "echo 'success'", type },
        { name: "postinstall", script: "npm run build", type: "replace" },
      ],
      {
        build: res[type],
        test: "jest",
        postinstall: "npm run build",
      },
    ];
  }),
];

test("add scripts to package.json", () => {
  for (const [scripts, add, res] of testCases()) {
    const pkg = { scripts };
    impl.addScriptsToPkgJson(pkg, add);
    expect(pkg).toEqual({ scripts: res });
  }
});

function* tarEntriesWithPkgJson(
  insertIndex = 0,
  content: string,
  ...args: Parameters<typeof tarEntries>
): Generator<DecodedEntry> {
  let inserted = false;

  const pkgJson: DecodedEntry = {
    headers: { name: "package.json" },
    content,
  };

  let i = 0;
  for (const e of tarEntries(...args)) {
    if (i === insertIndex) {
      inserted = true;
      yield pkgJson;
    }
    yield e;
    i++;
  }

  if (!inserted) yield pkgJson;
}

test("add scripts to tar entry stream", () =>
  Promise.all(
    testCases()
      .map(([scripts, add, res]) => {
        return [0, 5, -1].map(async insertIndex => {
          const r = tarEntriesWithPkgJson(
            insertIndex,
            JSON.stringify({ scripts }),
            {
              count: 10,
            },
          );
          const t = impl.addCustomScriptsToEntries(
            hybridEntriesFromDecodedEntries(r),
            add,
          );

          const result = await decodeAndCollectHybridEntries(t);
          const expected = [
            ...tarEntriesWithPkgJson(
              insertIndex,
              JSON.stringify({ scripts: res }, undefined, 2),
              { count: 10 },
            ),
          ];
          expect(result).toEqual(expected);
        });
      })
      .flat(1) satisfies Promise<void>[],
  ));
