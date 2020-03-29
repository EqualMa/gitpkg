"use strict";

const { SITE_META_FILE, PATH_DEST } = require("./scripts/constants");
const fs = require("fs").promises;
const promiseGenerated = fs
  .readFile(SITE_META_FILE, "utf-8")
  .then(str => JSON.parse(str));

const GA_ID = process.env.GA_ID;

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
    dest: PATH_DEST,
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
          popupComponent: "ServiceWorkerPopup",
          updatePopup: true,
          generateSWConfig: {
            importWorkboxFrom: "local",
          },
        },
      ],
      GA_ID
        ? [
            "@vuepress/google-analytics",
            {
              ga: GA_ID,
              importScript: "head-alternative",
            },
          ]
        : null,
    ].filter(Boolean),
  };
};
