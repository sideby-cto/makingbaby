import React from "react";
import Loader from "react-spinners/ClipLoader";
interface Props {
  className?: string;
  height?: number | string;
  color?: string;
  containerClassName?: string;
}

export const Loading: React.FC<Props> = ({
  containerClassName,
  className,
  color,
  height,
}) => (
  <div className={containerClassName}>
    <Loader className={className} color={color ?? "#000"} size={height ?? 30} />
  </div>
);
