import React from "react";

interface Props {
  backgroundColor?: string;
  title: string;
  onClick?: () => void;
  containerStyle?: string;
  loading?: boolean;
}

export const RoundedButton: React.FC<Props> = ({
  containerStyle = "py-2 px-3 text-xs bg-[#008080] text-white font-bold rounded-full",
  title = "Submit",
  backgroundColor,
  onClick,
  loading,
}) => (
  <button
    onClick={onClick}
    style={{ backgroundColor }}
    className={`${containerStyle} cursor-pointer`}
  >
    {loading ? "loading" : `${title}`}
  </button>
);
