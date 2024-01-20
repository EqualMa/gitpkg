import { useEffect, useRef, useState } from "react";
import cx from "../cx";
import ActionBar from "./ActionBar";
import ContentCopyIcon from "mdi-react/ContentCopyIcon";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function CopyText({
  copyText, // TODO:
  ...props
}: React.ComponentProps<typeof ActionBar> & { copyText: string }) {
  const [copyState, setCopyState] = useState<boolean | undefined>();
  const refTextInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setCopyState(undefined), 1000);

    return () => clearTimeout(timeout);
  }, [copyState]);

  const copySuccess = () => {
    setCopyState(true);
    refTextInput.current?.focus();
  };
  const copyError = () => {
    setCopyState(false);
  };

  return (
    <ActionBar {...props}>
      <input
        ref={refTextInput}
        className={cx`gitpkg-input with-right ${copyState === true && "success"}`}
        style={{ flex: "1 1 auto" }}
        type="text"
        value={copyText}
        readOnly
      />
      <CopyToClipboard
        text={copyText}
        onCopy={(_, success) => (success ? copySuccess() : copyError())}
      >
        <button
          className={cx`gitpkg-button icon with-left ${{
            success: copyState === true,
            error: copyState === false,
          }}`}
          type="button"
        >
          <ContentCopyIcon size={16} />
        </button>
      </CopyToClipboard>
    </ActionBar>
  );
}
