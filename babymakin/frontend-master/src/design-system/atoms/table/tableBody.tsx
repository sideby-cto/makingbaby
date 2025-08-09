import { TableBodyProps, TableBody as MUITableBody } from "@mui/material";
import React from "react";

export const TableBody: React.FC<TableBodyProps> = ({ children, ...props }) => {
  return <MUITableBody {...props}>{children}</MUITableBody>;
};
