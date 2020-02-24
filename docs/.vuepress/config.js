"use strict";
/* eslint-env node */
/* eslint @typescript-eslint/no-var-requires: "off" */

const { generateAssets } = require("../../scripts/gen-assets");
const promiseGenerated = generateAssets();

module.exports = async () => {
  const { head, name, description } = await promiseGenerated;

  return {
    title: name,
    description,
    themeConfig: {
      nav: [
        { text: "Home", link: "/" },
        { text: "Guide", link: "/guide/" },
        { text: "GitHub", link: "https://github.com/EqualMa/gitpkg" },
      ],
    },
    dest: "public",
    head: [
      ...head,
      ["link", { rel: "manifest", href: "/manifest.webmanifest" }],
      ["meta", { name: "theme-color", content: "#F06292" }],
      [
        "meta",
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      ],
      ["link", { rel: "mask-icon", href: "/favicon.svg", color: "#ffffff" }],
      ["meta", { name: "msapplication-TileImage", content: "/icon.svg" }],
      ["meta", { name: "msapplication-TileColor", content: "#F06292" }],
    ],
    plugins: [
      [
        // https://vuepress.vuejs.org/plugin/official/plugin-pwa.html#vuepress-plugin-pwa
        "@vuepress/pwa",
        {
          serviceWorker: true,
          updatePopup: true,
          generateSWConfig: {
            importWorkboxFrom: "local",
          },
        },
      ],
    ],
  };
};
