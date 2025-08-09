import { useTheme } from "@mui/material/styles";
import React from "react";
import { AiOutlineDelete } from "react-icons/ai";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { IconButton, Loading } from "../../../../components";
import { UserType } from "../../../../utils/types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "../../../atoms";
import { useUsersTable } from "./useUsersTable";

interface UsersTableProps {
  users?: UserType[];
  loading?: boolean;
  updateTableFunction?: (...args: any[]) => void;
  onClickRow?: (e?: any) => void;
  onDeleteRow?: Function;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users = [],
  loading,
  updateTableFunction,
  onClickRow,
  onDeleteRow,
}) => {
  const theme = useTheme();
  const {
    paginationState,
    rowsPerPageOptions,
    onChangeRowsPerPage,
    onChangePage,
  } = useUsersTable({ updateTableFunction });
  return (
    <>
      <Table sx={{ height: "81vh" }} stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Permission Level</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={4}>
                <Box className="w-full h-full flex items-center justify-center">
                  <Loading
                    containerClassName="w-fit"
                    height={"40px"}
                    color={(theme as any).colors.slate}
                  />
                </Box>
              </TableCell>
            </TableRow>
          )}
          {!loading && users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Box className="w-full h-full flex items-center justify-center">
                  No Data
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            users?.map((user, idx) => {
              const { name, email, permissionLevel } = user;
              const typeColor =
                permissionLevel === "District Leader" ||
                permissionLevel === "Organization Leader"
                  ? "#FF8E00"
                  : permissionLevel === "School Leader"
                  ? "#8E0505"
                  : permissionLevel === "Staff Member"
                  ? "#753188"
                  : "#3330E4";
              return (
                <TableRow
                  onClick={onClickRow?.bind(onClickRow, user)}
                  key={idx}
                  sx={{ border: 0 }}
                >
                  <TableCell>{name}</TableCell>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <span
                      style={{
                        color: typeColor,
                        backgroundColor: `${typeColor}20`,
                      }}
                      className="text-[12px] px-4 py-1 h-fit rounded-full"
                    >
                      {permissionLevel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      Icon={AiOutlineDelete}
                      iconProps={{ color: "#D61C4E", size: "1rem" }}
                      textStyle="text-sm font-inter text-[#D61C4E]"
                      containerStyle="flex items-center space-x-2 rounded-full px-4 py-1 h-fit hover:bg-[#D61C4E20] z-20"
                      title="delete"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onDeleteRow?.(user);
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <Box className="min-h-fit">
        <TablePagination
          sx={{
            display: "flex",
            alignItems: "flex-start",
          }}
          rowsPerPage={paginationState.rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          page={paginationState.page}
          ActionsComponent={({ onPageChange }) => (
            <Box className="space-x-10 flex mr-10 ml-10">
              <MdOutlineArrowBackIos
                onClick={(e: any) => {
                  onPageChange(
                    e,
                    paginationState.page > 0
                      ? paginationState.page - 1
                      : paginationState.page
                  );
                }}
                color={(theme as any).colors.slate}
              />
              <MdOutlineArrowForwardIos
                onClick={(e: any) => {
                  onPageChange(e, paginationState.page + 1);
                }}
                color={(theme as any).colors.slate}
              />
            </Box>
          )}
          count={paginationState.count}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangeRowsPerPage}
          component="div"
        />
      </Box>
    </>
  );
};
