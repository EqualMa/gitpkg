import CloseIcon from "mdi-react/CloseIcon";
import GithubIcon from "mdi-react/GithubIcon";
import { apiFromUrl } from "../gitpkg/api-from-url";
import ApiChoicesDisplay from "./ApiChoicesDisplay";
import SingleApiDisplay from "./SingleApiDisplay";
import CustomScripts from "./CustomScripts";
import ActionBar from "./ActionBar";
import { useState } from "react";
import cx from "../cx";
import { CustomScript } from "./CustomScriptEdit";

import styles from "./GitPkgApi.module.scss";

const DEFAULT_PLACEHOLDER =
  "https://github.com/<user>/<repo>/tree/<commit>/<subdir>";

export default function GitPkgApi() {
  // github tree url
  const [url, setUrl] = useState("");

  const placeholder = DEFAULT_PLACEHOLDER;

  const preview = !url;
  const urlToDisplay = url || placeholder;

  const [customScripts, setCustomScripts] = useState<CustomScript[]>([]);

  const api = apiFromUrl(urlToDisplay, customScripts);
  const error = api.data.originalUrl && api.type === "error";
  return (
    <div className={cx`${styles.container} ${preview && styles.preview}`}>
      <div className={styles.inputContainer}>
        <ActionBar
          text="Just paste your github url and copy the commands:"
          Prepend={GithubIcon}
        >
          <input
            className={cx`gitpkg-input with-right ${styles.mainInput} ${error && "error"}`}
            autoFocus
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder={placeholder}
          />
          <button
            className="gitpkg-button icon with-left"
            type="button"
            onClick={() => setUrl("")}
          >
            <CloseIcon size={16} />
          </button>
        </ActionBar>
      </div>
      <CustomScripts {...{ customScripts, setCustomScripts }} />
      {api.type === "choice" ? (
        <ApiChoicesDisplay apiList={api.possibleApis} />
      ) : (
        <SingleApiDisplay
          api={api}
          style={{
            minHeight: "20em",
            marginTop: "1.4em",
          }}
        />
      )}
    </div>
  );
}
