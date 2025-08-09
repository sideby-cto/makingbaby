import React, { FC, PropsWithChildren } from "react";

interface InnerPageWrapperProps extends PropsWithChildren {}

export const InnerPageWrapper: FC<InnerPageWrapperProps> = ({ children }) => (
  <div className="pb-6 space-y-12 w-full">{children}</div>
);
