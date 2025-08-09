import React, {
  ChangeEvent,
  CSSProperties,
  HTMLInputTypeAttribute,
} from "react";

interface TextInputProps {
  type?: HTMLInputTypeAttribute;
  className?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  style?: CSSProperties;
  value?: string;
  labelClassName?: string;
  errorMessage?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  type = "text",
  id,
  className = "rounded-[5px] p-1.5 border-[0.5px] bg-white border-[#0000004D] text-sm outline-[#008080]",
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  style,
  value,
  labelClassName = "text-[#00000080] text-xs font-bold",
  errorMessage,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <label className={labelClassName} htmlFor={name}>
        {label}
      </label>
      <div className="flex flex-col gap-1">
        <input
          type={type}
          id={id}
          className={className}
          name={name}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...style, outline: errorMessage ? "1px solid red" : "" }}
          value={value}
        />
        {errorMessage && (
          <span className="text-red-500 text-xs font-medium">
            {errorMessage}
          </span>
        )}
      </div>
    </div>
  );
};
