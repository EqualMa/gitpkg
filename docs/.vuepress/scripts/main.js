"use strict";

const fs = require("fs").promises;
const { generateAssets } = require("./gen-assets");
const { SITE_META_FILE } = require("./constants");

const main = async () => {
  const res = await generateAssets({ splashScreen: false });
  fs.writeFile(SITE_META_FILE, JSON.stringify(res));
};

main();
