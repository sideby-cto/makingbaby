import {
  TablePagination as MUITablePagination,
  TablePaginationProps as MUITablePaginationProps,
} from "@mui/material";
import React from "react";

type TablePaginationProps = MUITablePaginationProps & {
  component?: React.ElementType<any>;
};

export const TablePagination: React.FC<TablePaginationProps> = (props) => {
  return <MUITablePagination {...props} />;
};
