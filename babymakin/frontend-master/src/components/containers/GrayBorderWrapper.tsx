import React, { PropsWithChildren } from "react";

interface GrayBorderWrapperProps extends PropsWithChildren {
  padding?: boolean;
}

export const GrayBorderWrapper: React.FC<GrayBorderWrapperProps> = ({
  padding,
  children,
}) => {
  const paddingSize = padding === false ? "px-0" : "px-2";
  return (
    <div
      className={`w-full rounded-md ${paddingSize} border-[1px] border-[#DEDEDE] lg:border-none`}
    >
      {children}
    </div>
  );
};
