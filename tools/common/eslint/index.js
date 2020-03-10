module.exports = rootDir => ({
  root: true,
  overrides: [
    {
      files: "**/*.ts",
      parser: "@typescript-eslint/parser",
      parserOptions: {
        tsconfigRootDir: rootDir,
        project: "./tsconfig.json",
      },
      plugins: ["prettier", "@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
    {
      files: ["./*.js"],
      extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:node/recommended-script",
      ],
      rules: {
        "node/no-extraneous-require": [
          "error",
          {
            allowModules: ["@gitpkg/common"],
          },
        ],
      },
    },
  ],
});
