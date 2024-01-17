/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:prettier/recommended",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    EXPERIMENTAL_useProjectService: true,
  },
  plugins: ["@typescript-eslint", "react"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
    "@typescript-eslint/no-var-requires": [
      "error",
      {
        allow: ["\\.svg$"],
      },
    ],
  },
};
