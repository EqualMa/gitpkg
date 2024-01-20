import Select from "react-select";
// import ChevronDownIcon from "mdi-react/ChevronDownIcon";
import cx from "../cx";

const SelectDropdown = ({
  className,
  // height,
  ...props
}: React.ComponentProps<typeof Select> & { height: unknown }) => {
  return (
    <Select
      {...props}
      className={cx`gitpkg-select ${className}`}
      // TODO:
      // components={{
      //   DropdownIndicator: p => <ChevronDownIcon {...p} size={height} />,
      // }}
    />
  );
};

export default SelectDropdown as typeof Select;
