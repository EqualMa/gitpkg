import Link from "@docusaurus/Link";

const FUNDING_PLATFORMS = [
  { name: "Open Collective", link: "https://opencollective.com/gitpkg" },
  { name: "Ko-fi", link: "https://ko-fi.com/equalma" },
  { name: "爱发电", link: "https://afdian.net/a/equal" },
];

export default function Funding() {
  return (
    <>
      <p>
        If GitPkg is helpful, please consider sponsoring this project, thank you
        ❤️
      </p>
      <ul>
        {FUNDING_PLATFORMS.map(platform => (
          <li key={platform.link}>
            <Link to={platform.link}>{platform.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
