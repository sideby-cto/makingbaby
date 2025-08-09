import { FC, PropsWithChildren } from "react";

interface OuterPageWrapperProps extends PropsWithChildren {}

export const OuterPageWrapper: FC<OuterPageWrapperProps> = ({ children }) => (
  <div className="p-10 w-full bg-white overflow-y-auto h-full">{children}</div>
);
