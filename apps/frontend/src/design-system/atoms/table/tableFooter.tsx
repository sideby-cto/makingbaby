import { TableFooter as MUITableFooter, TableFooterProps } from "@mui/material";
import React from "react";

export const TableFooter: React.FC<TableFooterProps> = ({
  children,
  ...props
}) => {
  return <MUITableFooter {...props}>{children}</MUITableFooter>;
};
