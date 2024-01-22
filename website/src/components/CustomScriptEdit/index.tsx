import ActionBar from "../ActionBar";
import GSelect from "../SelectDropdown";
import CloseIcon from "mdi-react/CloseIcon";

import styles from "./styles.module.scss";
import cx from "@site/src/cx";

const scriptTypes = ["replace", "prepend", "append"] as const; // TODO: refactor

export type CustomScriptType = (typeof scriptTypes)[number];
export interface CustomScript {
  name: string;
  script: string;
  type: CustomScriptType;
  __key: string;
}

const options = scriptTypes.map(type => ({ type, label: type }));

const typeToOptions = new Map(options.map(opt => [opt.type, opt]));

export default function CustomScriptEdit({
  value,
  onChange,
  onRemove,
}: {
  value: CustomScript;
  onChange?: (newVal: CustomScript) => void;
  onRemove?: () => void;
}) {
  return (
    <ActionBar>
      <div className={styles.scriptActions}>
        <GSelect
          value={typeToOptions.get(value.type)}
          getOptionValue={opt => opt.type}
          onChange={newOpt => {
            newOpt ? onChange?.({ ...value, type: newOpt.type }) : onRemove?.();
          }}
          options={options}
          isClearable={false}
          isSearchable={false}
          className="relaxed"
          // style={{ flex: "0 0 auto" }} // TODO:
        />
        <input
          placeholder="name"
          className={cx`${styles.scriptAction} gitpkg-input`}
          style={{ flex: "1 1 60px", width: "60px" }}
          value={value.name}
          onChange={e => onChange?.({ ...value, name: e.target.value })}
        />
        <input
          placeholder="script content"
          className={`${styles.scriptAction} gitpkg-input`}
          style={{ flex: "1 1 auto" }}
          value={value.script}
          onChange={e => onChange?.({ ...value, script: e.target.value })}
        />
        <button
          type="button"
          className={`${styles.scriptAction} gitpkg-button icon`}
          style={{ flex: "0 1 auto" }}
          onClick={onRemove}
        >
          <CloseIcon size={16} />
        </button>
      </div>
    </ActionBar>
  );
}
