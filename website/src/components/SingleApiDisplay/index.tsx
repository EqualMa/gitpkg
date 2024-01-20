import CopyText from "../CopyText";
import PmIcon from "../PmIcon";
import ActionBar from "../ActionBar";
import ButtonGroup from "../ButtonGroup";
import DeveloperBoardIcon from "mdi-react/DeveloperBoardIcon";
import AlertIcon from "mdi-react/AlertCircleOutlineIcon";
import React, { useState } from "react";
import { installCommands } from "@site/src/gitpkg/install-command";
import { SingleApi } from "@site/src/gitpkg/api-from-url";

export default function SingleApiDisplay({
  api,
  style,
}: {
  api: SingleApi;
  style?: React.CSSProperties;
}) {
  const [showSuggested, setShowSuggested] = useState(true);
  const [selectedDependencyType, setSelectedDependencyType] =
    useState("dependency");

  if (api.type === "error") {
    return (
      <div style={style}>
        {api.errorType === "platform-not-supported" ? (
          <ActionBar>
            <span className="error">
              {/*  */}
              Only github.com is supported currently
            </span>
          </ActionBar>
        ) : undefined}
      </div>
    );
  } else {
    const installUrl =
      showSuggested && api.suggestion ? api.suggestion.apiUrl : api.apiUrl;

    const commands = installCommands(installUrl);
    const warnForWindows = installUrl.includes("&");
    const pkgJsonForWindows = `"{package-name}": "${installUrl}"`;

    const dependencyTypes = commands.dependencyTypes.map(d => ({
      label: d,
      value: d,
    }));

    return (
      <div style={style}>
        <ActionBar text="Select dependency type" Prepend={DeveloperBoardIcon}>
          <ButtonGroup
            style={{ flex: "1 1 0" }}
            value={selectedDependencyType}
            onChange={newVal => setSelectedDependencyType(newVal)}
            entries={dependencyTypes}
            name="dependencyType"
          />
        </ActionBar>
        {commands.managerNames.map(manager => (
          <CopyText
            key={manager}
            copyText={commands.commands[manager][selectedDependencyType]}
            Prepend={({ size }: { size?: string }) => (
              <PmIcon name={manager} size={size} />
            )}
          ></CopyText>
        ))}

        {api.type === "warn" && api.warnType === "suggest-to-use" && (
          <ActionBar text="It seems that no sub folder or custom scripts are specified so you don't need to use GitPkg.">
            <button
              className="gitpkg-button"
              style={{ flex: "1 1 0" }}
              type="button"
              onClick={() => setShowSuggested(v => !v)}
            >
              {showSuggested
                ? "See GitPkg API (not recommended)"
                : "Show recommended commands"}
            </button>
          </ActionBar>
        )}

        {warnForWindows && (
          <CopyText
            copyText={pkgJsonForWindows}
            text={
              <div className="warning" style={{ marginBottom: "0.6em" }}>
                If you use windows, errors may occur when running
                <code>npm install ...</code> or <code>yarn add ...</code>
                because the url contains
                <code>&</code>. In such cases, you will have to add
              </div>
            }
            appendText={
              <span className="warning">
                to {`"dependencies / devDependencies" `}
                of your package.json and run
                <code>npm install</code> or <code>yarn install</code>
                manually to install the dependency
              </span>
            }
            Prepend={({ size }: { size?: string }) => (
              <AlertIcon size={size} className="warning" />
            )}
          ></CopyText>
        )}
      </div>
    );
  }
}
