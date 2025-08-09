import { TableCellProps, TableCell as MUITableCell } from "@mui/material";
import React from "react";

export const TableCell: React.FC<TableCellProps> = ({ children, ...props }) => {
  return <MUITableCell {...props}>{children}</MUITableCell>;
};
