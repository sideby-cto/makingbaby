import React, {
  ChangeEvent,
  CSSProperties,
  HTMLInputTypeAttribute,
} from "react";

interface SelectProps {
  containerClassName?: string;
  type?: HTMLInputTypeAttribute;
  className?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: (event: ChangeEvent<HTMLSelectElement>) => void;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  style?: CSSProperties;
  value?: string;
  options: { label: string; value: string }[];
  allowNoneOption?: boolean;
  labelClassName?: string;
  errorMessage?: string;
  multiple?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  id,
  className = "w-full rounded-[5px] p-1.5 border-[0.5px] bg-white border-[#0000004D] text-sm focus:outline-none",
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  style,
  value,
  options,
  allowNoneOption,
  labelClassName = "text-[#00000080] text-xs font-bold",
  errorMessage,
  multiple,
  containerClassName,
}) => (
  <div
    className={containerClassName ?? `flex flex-col gap-3 w-full max-w-full`}
  >
    <label className={labelClassName} htmlFor={name}>
      {label}
    </label>
    <div className="flex flex-col">
      <select
        id={id}
        className={className}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        style={style}
        value={value}
        multiple={multiple}
      >
        {!allowNoneOption && (
          <option value="">{placeholder || "Select"}</option>
        )}
        {(
          options.map(({ value, label }, index) => (
            <React.Fragment key={index}>
              <option value={value}>{label}</option>
            </React.Fragment>
          ))
        )}
      </select>
      {errorMessage && (
        <span className="text-red-500 text-xs font-medium">{errorMessage}</span>
      )}
    </div>
  </div>
);
