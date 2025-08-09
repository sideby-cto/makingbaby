import { useEffect } from "react";
import { useReducer } from "react";

interface UsersTableHookParams {
  updateTableFunction?: (...args: any[]) => void;
}

interface PaginationState {
  rowsPerPage: number;
  page: number;
  count: number;
}
interface PaginationAction {
  type: "changePage" | "changeRowsPerPage";
  payload?: unknown;
}

const rowsPerPageOptions = [25];

const InitialPaginationState: PaginationState = {
  count: -1,
  page: 0,
  rowsPerPage: 25,
};

const paginationReducer = (
  state: PaginationState,
  action: PaginationAction
): PaginationState => {
  switch (action.type) {
    case "changePage":
      return { ...state, page: action.payload as number };
    case "changeRowsPerPage":
      return { ...state, rowsPerPage: action?.payload as number };
    default:
      return state;
  }
};

export const useUsersTable = ({
  updateTableFunction,
}: UsersTableHookParams) => {
  const [paginationState, dispatch] = useReducer(
    paginationReducer,
    InitialPaginationState
  );

  const onChangePage = (_: any, page: number) => {
    dispatch({ type: "changePage", payload: page });
  };
  const onChangeRowsPerPage = (e: any) => {
    dispatch({ type: "changeRowsPerPage", payload: e.target.value });
  };

  useEffect(() => {
    const { page, rowsPerPage } = paginationState;
    updateTableFunction?.({
      pageSize: rowsPerPage,
      currentPage: page,
      enabled: true,
    });
  }, [paginationState]);

  return {
    paginationState,
    onChangePage,
    onChangeRowsPerPage,
    rowsPerPageOptions,
  };
};
