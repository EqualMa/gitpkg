import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import * as manifest from "./static/manifest.json";

// TODO: ROUTE: /guide
// TODO: DOCS ABOUT ROUTE
// TODO: SMALL SCREEN  NAV LINK DO NOT COLLAPSE

const GITHUB = "https://github.com/EqualMa/gitpkg";

const GADS_ID = process.env.GADS_ID;
const GTAG_ID = process.env.GTAG_ID;

function appleTouchIcons(sizes: string[]) {
  return sizes.map(size => ({
    tagName: "link",
    rel: "apple-touch-icon",
    sizes: `${size}x${size}`,
    href: `/img/icons/favicon-${size}.png`,
  }));
}

const config: Config = {
  title: manifest.name,
  tagline: manifest.description,
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

  headTags: [
    GADS_ID
      ? {
          tagName: "script",
          attributes: {
            async: "async",
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GADS_ID}`,
            crossorigin: "anonymous",
          },
        }
      : undefined,
  ].filter(Boolean as unknown as <T>(x: T) => x is Exclude<T, undefined>),

  plugins: [
    "docusaurus-plugin-sass",
    [
      "@docusaurus/plugin-pwa",
      {
        debug: true,
        offlineModeActivationStrategies: [
          "appInstalled",
          "standalone",
          "queryString",
        ],
        pwaHead: [
          {
            tagName: "link",
            rel: "icon",
            href: "/img/docusaurus.png",
          },
          {
            tagName: "link",
            rel: "manifest",
            href: "/manifest.json", // your PWA manifest
          },
          {
            tagName: "meta",
            name: "theme-color",
            content: manifest.theme_color,
          },
          {
            tagName: "link",
            rel: "icon",
            type: "image/png",
            sizes: "196x196",
            href: "/img/icons/favicon-196.png",
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-capable",
            content: "yes",
          },
          ...appleTouchIcons(["180", "167", "152", "120"]),
          {
            tagName: "meta",
            name: "msapplication-TileImage",
            content: "/img/logo.svg",
          },
          {
            tagName: "meta",
            name: "msapplication-TileColor",
            content: "#F06292",
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-status-bar-style",
            content: "default",
          },
          {
            tagName: "link",
            rel: "mask-icon",
            href: "/img/favicon.svg",
            color: "#ffffff",
          },
        ],
      },
    ],
  ],

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
        gtag: GTAG_ID ? { trackingID: GTAG_ID } : undefined,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: "img/social-card.jpg",
    navbar: {
      title: manifest.name,
      logo: {
        alt: `${manifest.name} Logo`,
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
