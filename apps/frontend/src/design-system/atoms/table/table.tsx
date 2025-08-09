import {
  Paper,
  Table as MUITable,
  TableContainer,
  TableProps,
} from "@mui/material";
import React from "react";

export const Table: React.FC<TableProps> = ({ children, ...props }) => {
  return (
    <TableContainer component={Paper}>
      <MUITable {...props}>{children}</MUITable>
    </TableContainer>
  );
};
