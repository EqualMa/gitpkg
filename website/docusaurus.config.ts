import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// TODO: ROUTE: /guide
// TODO: DOCS ABOUT ROUTE
// TODO: SMALL SCREEN  NAV LINK DO NOT COLLAPSE

const GITHUB = "https://github.com/EqualMa/gitpkg";

const config: Config = {
  title: "GitPkg",
  tagline: "Using sub folders of a repo as yarn/npm dependencies made easy",
  favicon: "img/favicon.svg",

  // Set the production url of your site here
  url: "https://gitpkg.vercel.app",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: "facebook", // Usually your GitHub org/user name.
  // projectName: "docusaurus", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: ["docusaurus-plugin-sass"],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: `${GITHUB}/tree/main/website`,
          // GitHub prevents about as username or org name,
          // so GitPkg can reserve /about/** for docs
          routeBasePath: "/about",
        },
        blog: false,
        theme: {
          customCss: [
            //
            "./src/css/custom.css",
            "./src/css/custom.scss",
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "GitPkg",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        { to: "/", label: "Home", position: "right" },
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "right",
          label: "Guide",
        },
        {
          href: "https://github.com/facebook/docusaurus",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      // style: "dark",
      copyright: `MIT Licensed | Copyright © ${new Date().getFullYear()} Equal Ma`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
