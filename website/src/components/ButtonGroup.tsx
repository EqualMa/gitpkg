import styles from "./ButtonGroup.module.scss";
import cx from "../cx";

export default function ButtonGroup<V extends string = string>({
  onChange,
  entries,
  value: selectedValue,
  name,
  style,
}: {
  name: string;
  entries: { value: V; label: React.ReactNode }[];
  value: V;
  onChange: (value: V) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div className={styles.buttonsWrapper} style={style}>
      {entries.map(e => (
        <label
          key={e.value}
          className={cx`gitpkg-button ${styles.groupButtonEntry} with-right ${selectedValue === e.value && "checked"}`}
        >
          <span>{e.label}</span>
          <input
            type="radio"
            name={name}
            value={e.value}
            checked={selectedValue === e.value}
            onChange={event => event.target.checked && onChange(e.value)}
          />
        </label>
      ))}
    </div>
  );
}
