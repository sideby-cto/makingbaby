import { TableRow as MUITableRow, TableRowProps } from "@mui/material";
import React from "react";

export const TableRow: React.FC<TableRowProps> = ({ children, ...props }) => {
  return <MUITableRow {...props}>{children}</MUITableRow>;
};
