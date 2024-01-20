import ActionBar from "./ActionBar";
import CustomScriptEdit, { CustomScript } from "./CustomScriptEdit";
import WrenchOutlineIcon from "mdi-react/WrenchOutlineIcon";
import HelpIcon from "mdi-react/HelpIcon";

function seeCustomScriptHelp() {
  window.open("/about/guide/#custom-scripts");
}

export default function CustomScripts({
  customScripts,
  setCustomScripts,
}: {
  customScripts: CustomScript[];
  setCustomScripts: React.Dispatch<React.SetStateAction<CustomScript[]>>;
}) {
  const addCustomScript = () => {
    if (customScripts.length > 0) {
      const last = customScripts[customScripts.length - 1];
      if (last.name === "" && last.script === "") return;
    }

    setCustomScripts(old => [
      ...old,
      {
        name: "",
        script: "",
        type: "replace",
        __key: new Date().getTime().toString() + "-" + Math.random().toString(),
      },
    ]);
  };

  const removeCustomScript = (i: number) => {
    setCustomScripts(customScripts => {
      const newArr = [...customScripts];
      newArr.splice(i, 1);
      return newArr;
    });
  };

  return (
    <ActionBar
      Prepend={WrenchOutlineIcon}
      text={
        <>
          Custom Scripts
          <div style={{ marginBottom: "1.4em" }}>
            {customScripts.map((cs, i) => (
              <CustomScriptEdit
                key={cs.__key}
                value={customScripts[i]}
                onChange={newVal => {
                  const arr = [...customScripts];
                  arr[i] = newVal;
                  setCustomScripts(arr);
                }}
                onRemove={() => removeCustomScript(i)}
              />
            ))}
          </div>
        </>
      }
    >
      <button
        className="gitpkg-button"
        style={{ flex: "1 1 0" }}
        type="button"
        onClick={addCustomScript}
      >
        Add a custom script
      </button>
      <button
        className="gitpkg-button icon with-left"
        type="button"
        onClick={seeCustomScriptHelp}
      >
        <HelpIcon size={16} />
      </button>
    </ActionBar>
  );
}
