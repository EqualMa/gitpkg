import Select from "react-select";
import type * as rs from "react-select";
import ChevronDownIcon from "mdi-react/ChevronDownIcon";
import cx from "../cx";
import clsx from "clsx";

function Control(props: rs.ControlProps) {
  const { children, isDisabled, isFocused, innerRef, innerProps, menuIsOpen } =
    props;

  return (
    <div
      ref={innerRef}
      className={clsx(props.className, "gitpkg-select__control", {
        "gitpkg-select__control--is-disabled": isDisabled,
        "gitpkg-select__control--is-focused": isFocused,
        "gitpkg-select__control--menu-is-open": menuIsOpen,
      })}
      {...innerProps}
      aria-disabled={isDisabled || undefined}
    >
      {children}
    </div>
  );
}

const SelectDropdown = ({
  className,
  // height,
  ...props
}: React.ComponentProps<typeof Select> & { height: unknown }) => {
  return (
    <Select
      {...props}
      className={cx`gitpkg-select ${className}`}
      classNamePrefix="gitpkg-select"
      components={{
        Control,
        DropdownIndicator: () => <ChevronDownIcon size={"24"} />,
        IndicatorSeparator: null,
      }}
    />
  );
};

export default SelectDropdown as typeof Select;
