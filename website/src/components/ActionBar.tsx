import cx from "../cx";
import styles from "./ActionBar.module.scss";

export default function ActionBar({
  children,
  text,
  appendText,
  Prepend,
}: {
  children?: React.ReactNode;
  text?: React.ReactNode;
  appendText?: React.ReactNode;
  Prepend?:
    | React.ElementType<{ size?: string }>
    | import("mdi-react").MdiReactIconComponentType;
}) {
  return (
    <div className={cx`${styles.bar} ${text && "with-text"}`}>
      {text && <div className={"bar-text-container"}>{text}</div>}
      <div className={"bar-prepend"}>{Prepend && <Prepend size="2.4em" />}</div>
      {children}
      {appendText && (
        <div className={`bar-text-container bar-text-container-bottom`}>
          {appendText}
        </div>
      )}
    </div>
  );
}
