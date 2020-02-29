"use strict";

const { generateImages } = require("pwa-asset-generator");
const path = require("path");
const fs = require("fs").promises;
const rimraf = require("rimraf");
const parse5 = require("parse5");

const PATH_PUBLIC = path.join(__dirname, "../docs/.vuepress/public/");
const PATH_BASE_MANIFEST = path.join(__dirname, "manifest.webmanifest");
const PATH_MANIFEST = path.join(PATH_PUBLIC, "manifest.webmanifest");
const PATH_ICON = path.join(PATH_PUBLIC, "icon.svg");
const PATH_FAVICON = path.join(PATH_PUBLIC, "favicon.svg");

const PATH_GEN_ICONS = path.join(PATH_PUBLIC, "icons/");

const BACKGROUND =
  "radial-gradient(circle, rgba(225,174,238,1) 0%, rgba(238,174,202,1) 100%)";

const GEN_ASSETS_OPTIONS = {
  scrape: true,
  log: false,
  type: "png",
};

function relative(from, to) {
  return path
    .relative(from, to)
    .split(path.sep)
    .join("/");
}

function resetDir(dir) {
  return new Promise((resolve, reject) => {
    rimraf(dir, err => {
      if (err) reject(err);
      else resolve();
    });
  }).then(() => fs.mkdir(dir, { recursive: true }));
}

function parseXml(xml) {
  const { childNodes } = parse5.parseFragment(xml);
  return childNodes
    .map(c => {
      if (c.nodeName === "#text") return null;
      return [
        c.tagName,
        Object.assign(
          {},
          ...c.attrs.map(({ name, value }) => ({ [name]: value })),
        ),
      ];
    })
    .filter(Boolean);
}

exports.generateAssets = async ({ splashScreen = true }) => {
  const [baseManifest] = await Promise.all([
    fs.readFile(PATH_BASE_MANIFEST, "utf-8").then(text => {
      fs.writeFile(PATH_MANIFEST, text);
      return JSON.parse(text);
    }),
    resetDir(PATH_GEN_ICONS),
  ]);

  const { htmlMeta: htmlMetaIcon } = await generateImages(
    PATH_FAVICON,
    PATH_GEN_ICONS,
    {
      ...GEN_ASSETS_OPTIONS,
      opaque: false,
      favicon: true,
      iconOnly: true,
      log: false,
      type: "png",
    },
  );

  const { htmlMeta } = await generateImages(PATH_ICON, PATH_GEN_ICONS, {
    ...GEN_ASSETS_OPTIONS,
    background: BACKGROUND,
    padding: "0",
    manifest: PATH_MANIFEST,
    iconOnly: !splashScreen,
  });

  const headStr =
    htmlMetaIcon.favicon +
    Object.keys(htmlMeta)
      .map(k => htmlMeta[k])
      .join("");

  const manifestDir = path.dirname(PATH_MANIFEST);

  const head = parseXml(headStr).map(([tag, attrs, ...args]) => {
    if (attrs.href) {
      attrs = {
        ...attrs,
        href: relative(manifestDir, attrs.href),
      };
    }

    return [tag, attrs, ...args];
  });

  return {
    head,
    name: baseManifest.name,
    description: baseManifest.description,
  };
};
