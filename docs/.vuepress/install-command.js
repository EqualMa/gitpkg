const managerAndCommands = {
  yarn: "yarn add",
  npm: "npm install",
};
const dependencyTypesAndArgs = {
  dependency: "",
  dev: "-D",
  peer: "-P",
  optional: "-O",
  exact: "-E",
  tilde: "-T",
};

const managerNames = Object.keys(managerAndCommands);
const dependencyTypes = Object.keys(dependencyTypesAndArgs);

export function installCommands(url) {
  const commands = Object.assign(
    {},
    ...managerNames.map(m => ({
      [m]: Object.assign(
        {},
        ...dependencyTypes.map(d => ({
          [d]: [managerAndCommands[m], dependencyTypesAndArgs[d], url]
            .filter(Boolean)
            .join(" "),
        })),
      ),
    })),
  );

  return { managerNames, dependencyTypes, commands };
}
