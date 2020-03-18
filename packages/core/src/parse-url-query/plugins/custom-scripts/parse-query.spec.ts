import * as impl from "./parse-query";

test("check if query key is custom script", () => {
  expect(impl.queryKeyIsCustomScript("scripts.postinstall")).toBe(true);
  expect(impl.queryKeyIsCustomScript("scripts.")).toBe(true);

  expect(impl.queryKeyIsCustomScript("scripts")).toBe(false);
});

test("parse script (string)", () => {
  expect(() => {
    impl.parseQueryAsCustomScript("foo", "yarn build");
  }).toThrowError();

  expect(
    impl.parseQueryAsCustomScript("scripts.postinstall", "yarn build"),
  ).toStrictEqual<impl.PkgCustomScript>({
    name: "postinstall",
    script: "yarn build",
    type: "replace",
  });

  expect(
    impl.parseQueryAsCustomScript("scripts.postinstall", "&& yarn build"),
  ).toStrictEqual<impl.PkgCustomScript>({
    name: "postinstall",
    script: "yarn build",
    type: "append",
  });

  expect(
    impl.parseQueryAsCustomScript("scripts.postinstall", "yarn build &&"),
  ).toStrictEqual<impl.PkgCustomScript>({
    name: "postinstall",
    script: "yarn build",
    type: "prepend",
  });
});

test("parse script (string array)", () => {
  expect(
    impl.parseQueryAsCustomScript("scripts.postinstall", [
      "yarn install",
      "yarn build",
    ]),
  ).toStrictEqual<impl.PkgCustomScript>({
    name: "postinstall",
    script: "yarn install && yarn build",
    type: "replace",
  });

  expect(
    impl.parseQueryAsCustomScript("scripts.postinstall", [
      "&& yarn install",
      "yarn build",
    ]),
  ).toStrictEqual<impl.PkgCustomScript>({
    name: "postinstall",
    script: "yarn install && yarn build",
    type: "append",
  });

  expect(
    impl.parseQueryAsCustomScript("scripts.postinstall", [
      "yarn install",
      "yarn build &&",
    ]),
  ).toStrictEqual<impl.PkgCustomScript>({
    name: "postinstall",
    script: "yarn install && yarn build",
    type: "prepend",
  });
});
