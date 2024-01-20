import SingleApiDisplay from "./SingleApiDisplay";
import ActionBar from "./ActionBar";
import ButtonGroup from "./ButtonGroup";

import SourceCommitIcon from "mdi-react/SourceCommitIcon";
import type { SingleApi } from "../gitpkg/api-from-url";
import React from "react";

export default function ApiChoicesDisplay({
  apiList,
}: {
  apiList: SingleApi[];
}) {
  const [selectedIndex, setSelectedIndex] = React.useState("0");

  const selected = apiList[selectedIndex as never] satisfies
    | SingleApi
    | undefined;
  const selectEntries = apiList.map((api, i) => ({
    value: String(i),
    label: api.data.commit,
  }));

  return (
    <div>
      {selectEntries.length > 1 && (
        <ActionBar
          appendText={
            selected && (
              <>
                You select commit <code>{selected.data.commit}</code>,{" "}
                {selected.data.subdir ? "" : "no"} sub folder
                {selected.data.subdir && <code>{selected.data.subdir}</code>}
              </>
            )
          }
          text="Select the correct commit name"
          Prepend={SourceCommitIcon}
        >
          <ButtonGroup
            style={{ flex: "1 1 0" }}
            entries={selectEntries}
            value={selectedIndex}
            onChange={setSelectedIndex}
            name="branch"
          />
        </ActionBar>
      )}
      {selected && <SingleApiDisplay api={selected} />}
    </div>
  );
}
