import React from "react";
import { Loading } from "src/components";

interface FormSubmitButtonProps {
  backgroundColor?: string;
  title: string;
  textStyle?: string;
  onClick?: (e?: any) => void;
  containerStyle?: string;
  type?: "submit" | "reset" | "button";
  loading?: boolean;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  containerStyle = "py-2 text-white bg-[#008080] font-bold rounded-lg w-full flex justify-center items-center",
  title = "Submit",
  backgroundColor,
  onClick,
  type = "submit",
  loading,
}) => (
  <button
    type={type}
    onClick={onClick}
    style={{ backgroundColor }}
    className={containerStyle}
    disabled={loading}
  >
    {loading ? <Loading color="#fff" /> : `${title}`}
  </button>
);
