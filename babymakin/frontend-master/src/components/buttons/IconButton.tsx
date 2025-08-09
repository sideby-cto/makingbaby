import React, { ComponentType } from "react";

interface IconButtonProps {
  backgroundColor?: string;
  title: string;
  textStyle?: string;
  Icon: ComponentType<any>;
  iconProps?: { color: string; size: string; className?: string };
  containerStyle?: string;
  onClick?: (e?: any) => void;
  iconPosition?: "start" | "end";
  style?: any;
}

export const IconButton: React.FC<IconButtonProps> = ({
  Icon,
  title,
  onClick,
  iconPosition,
  textStyle,
  iconProps,
  containerStyle,
  style,
}) => (
  <div
    style={style}
    onClick={onClick}
    className={`${containerStyle} cursor-pointer`}
  >
    {iconPosition === "end" ? (
      <>
        <span className={`${textStyle}`}>{title}</span>
        <Icon {...iconProps} />
      </>
    ) : (
      <>
        <Icon {...iconProps} />
        <span className={textStyle}>{title}</span>
      </>
    )}
  </div>
);
