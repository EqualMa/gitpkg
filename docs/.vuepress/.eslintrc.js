module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:node/recommended-module",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  overrides: [
    {
      files: ["./config.js", "scripts/**/*.js"],
      extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:node/recommended-script",
      ],
      rules: {
        "node/no-extraneous-require": [
          "error",
          {
            allowModules: ["rimraf"],
          },
        ],
      },
    },
  ],
};
