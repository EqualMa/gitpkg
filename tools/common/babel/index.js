module.exports = () => ({
  presets: [
    [
      "@babel/env",
      {
        targets: {
          node: "6",
        },
        // useBuiltIns: "usage", // TODO chore: core-js@3
      },
    ],
  ],
});
