interface PkgManagerDefs {
  yarn: never;
  npm: never;
}

type PkgManagerName = keyof PkgManagerDefs;

const managerAndCommands = {
  yarn: "yarn add",
  npm: "npm install",
} satisfies Record<PkgManagerName, string>;

interface PMArgFnInput {
  managerName: PkgManagerName;
  dependencyType: DependencyType;
  url: string;
}

type ArgsForOnePM = string | ((input: PMArgFnInput) => string);

/** Arguments of package managers */
type PMArgs = ArgsForOnePM | Partial<Record<PkgManagerName, ArgsForOnePM>>;

interface DependencyTypeDefs {
  dependency: never;
  dev: never;
  peer: never;
  optional: never;
  bundle: never;
}

type DependencyType = keyof DependencyTypeDefs;

// yarn
// https://classic.yarnpkg.com/en/docs/cli/add/
// npm
// https://docs.npmjs.com/cli/install#synopsis
const dependencyTypesAndArgs: Record<DependencyType, PMArgs> = {
  dependency: "",
  dev: "-D",
  peer: {
    yarn: "-P",
    npm: ({ url }) => `"{your-package-name}": ${JSON.stringify(url)}`,
  },
  optional: "-O",
  // exact: "-E",
  // tilde: "-T",
  bundle: { npm: "-B" },
};

const managerNames = Object.keys(managerAndCommands) as PkgManagerName[];
const dependencyTypes = Object.keys(dependencyTypesAndArgs) as DependencyType[];

function getInstallCommand(
  managerName: PkgManagerName,
  dependencyType: DependencyType,
  url: string,
): string {
  const command = managerAndCommands[managerName];

  let depTypeArg: PMArgs | undefined = dependencyTypesAndArgs[dependencyType];

  if (typeof depTypeArg === "object" && depTypeArg !== null) {
    depTypeArg = depTypeArg[managerName];
  }

  if (typeof depTypeArg === "string") {
    return [command, depTypeArg, "'" + url + "'"].filter(Boolean).join(" ");
  } else if (typeof depTypeArg === "function") {
    return depTypeArg({ managerName, dependencyType, url });
  } else if (typeof depTypeArg === "undefined" || depTypeArg === null) {
    return "";
  }

  throw new Error(
    `Arg definition wrong for [Manager=${managerName} & DependencyType=${dependencyType}`,
  );
}

export function installCommands(url: string) {
  const commands = Object.fromEntries(
    managerNames.map(m => [
      m,
      Object.fromEntries(
        dependencyTypes.map(d => [
          //
          d,
          getInstallCommand(m, d, url),
        ]),
      ),
    ]),
  );

  return { managerNames, dependencyTypes, commands };
}
