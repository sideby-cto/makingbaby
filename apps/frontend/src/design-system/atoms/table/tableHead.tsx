import { TableHead as MUITableHead, TableHeadProps } from "@mui/material";
import React from "react";

export const TableHead: React.FC<TableHeadProps> = ({ children, ...props }) => {
  return <MUITableHead {...props}>{children}</MUITableHead>;
};
