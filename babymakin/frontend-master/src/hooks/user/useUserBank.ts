/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from "react";
import { ENDPOINTS } from "../../api";
import { UserType } from "../../core";
import {
  debounce,
  useCollections,
  useGetUsers,
  useSelector,
  _useMutateCollections,
} from "../../utils";
import {
  ConfigurationModalContentType,
  DataForDeleteModalType,
  ModalConfig,
  UsersModalContentType,
} from "../../utils/types";
export interface GetUsersParam {
  currentPage: number;
  pageSize: number;
  enabled: boolean;
  filter?: string;
}

export const useUserBank = () => {
  const {
    collections: { allOrganizations, allDistricts, allTeams, allSchools },
  } = useCollections();

  const [getUsersParam, setGetUsersParam] = useState<GetUsersParam>({
    currentPage: 0,
    enabled: true,
    pageSize: 25,
    filter: "",
  });
  const {
    data: allUsers,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useGetUsers(getUsersParam);
  const { selectorFunction: setUserToDelete, value: userToDelete } =
    useSelector<DataForDeleteModalType>();
  const [userModalConfig, setUserModalConfig] =
    useState<ModalConfig<"create-or-edit-user"> | null>(null);
  const [modalContent, setModalContent] = useState<UsersModalContentType>("");
  const [openModal, setOpenModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  /**Delete Logic */
  const onDeleteUserSuccess = () => {
    setModalContent("delete-user-success");
  };
  const { handler: deleteUserFunction, isPending: isDeletingUser } =
    _useMutateCollections({
      mutation: "deleteData",
      successCallback: onDeleteUserSuccess,
      errorMessage: "Failed to delete user",
    });
  const openDeleteUserModal = (userData: UserType) => {
    setModalContent("delete-user");
    setOpenModal(true);
    setUserToDelete({
      _id: (userData as any).id,
      listTitle: "Teams",
      itemTitle: userData?.name,
      loading: isDeletingUser,
      deleteRoute: ENDPOINTS.users,
    });
  };

  const createNewTableRow = (row: ConfigurationModalContentType) => {
    toggleModal();
    setUserModalConfig({ type: "create", data: {} as any });
    setModalContent("create-or-edit-user");
  };

  const onUserRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-user");
    setUserModalConfig({ type: "update", data });
    toggleModal();
  };

  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  const searchInputHandler = (e: any) => {
    setSearchKeyword(e.target.value);
  };

  const filterData = (filter: string) => {
    setGetUsersParam({ ...getUsersParam, filter: filter });
  };
  const filterUsersByKeyword = useCallback(debounce(filterData), [
    getUsersParam,
  ]);

  return {
    filterUsersByKeyword,
    searchInputHandler,
    onUserRowClickHandler,
    createNewTableRow,
    openDeleteUserModal,
    deleteUserFunction,
    allOrganizations,
    allDistricts,
    allTeams,
    allSchools,
    allUsers,
    loadingUsers,
    refetchUsers,
    userToDelete,
    userModalConfig,
    modalContent,
    searchKeyword,
    toggleModal,
    isDeletingUser,
    setGetUsersParam,
    openModal,
  };
};
