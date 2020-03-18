const managerAndCommands = {
  yarn: "yarn add",
  npm: "npm install",
};

// yarn
// https://classic.yarnpkg.com/en/docs/cli/add/
// npm
// https://docs.npmjs.com/cli/install#synopsis
const dependencyTypesAndArgs = {
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

const managerNames = Object.keys(managerAndCommands);
const dependencyTypes = Object.keys(dependencyTypesAndArgs);

function getInstallCommand(managerName, dependencyType, url) {
  const command = managerAndCommands[managerName];

  let depTypeArg = dependencyTypesAndArgs[dependencyType];

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

export function installCommands(url) {
  const commands = Object.assign(
    {},
    ...managerNames.map(m => ({
      [m]: Object.assign(
        {},
        ...dependencyTypes.map(d => ({
          [d]: getInstallCommand(m, d, url),
        })),
      ),
    })),
  );

  return { managerNames, dependencyTypes, commands };
}
