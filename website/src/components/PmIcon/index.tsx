import NpmIcon from "mdi-react/NpmIcon";
import YarnSvg from "./yarn-svg-content.svg";

import styles from "./styles.module.css";

export default function PmIcon({
  name,
  size,
  role,
  xmlns = 'xmlns="http://www.w3.org/2000/svg"',
}: {
  name: string;
  size?: string | number;
  role?: string;
  xmlns?: string;
}) {
  const className = styles[name];
  return name === "yarn" ? (
    <div className={className} style={{ width: size, height: size }}>
      <span className="mdi" role={role} aria-label="yarn icon">
        <YarnSvg xmlns={xmlns} width={size} height={size} />
      </span>
    </div>
  ) : name === "npm" ? (
    <div className={className} style={{ width: size, height: size }}>
      <NpmIcon size={size} />
    </div>
  ) : (
    <div>{name}</div>
  );
}
