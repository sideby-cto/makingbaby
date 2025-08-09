/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useEffect } from "react";
import { BiPlus } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import {
  ConfirmDeleteSuccessModal,
  ConfirmDeletionModal,
  CreateOrEditUsersModal,
  IconButton,
  ModalWrap,
  H1,
  OuterPageWrapper,
} from "src/components";
import { UsersTable } from "../../../design-system/components";
import { useUserBank } from "../../../hooks";
import { protectRoute } from "../../../utils";

const Component: React.FC = () => {
  const {
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
    openModal,
    setGetUsersParam,
  } = useUserBank();

  const renderModal = () => {
    switch (modalContent) {
      case "create-or-edit-user":
        return (
          <CreateOrEditUsersModal
            organizations={allOrganizations}
            districts={allDistricts}
            teams={allTeams}
            schools={allSchools}
            onCloseModalClick={toggleModal}
            type={userModalConfig?.type === "create" ? "create" : "update"}
            populatedData={userModalConfig?.data}
            refetch={refetchUsers}
          />
        );
      case "delete-user":
        return (
          <ConfirmDeletionModal
            onConfirmClick={() => {
              if (userToDelete) {
                (deleteUserFunction as any)({
                  _id: userToDelete?._id,
                  route: userToDelete?.deleteRoute,
                });
              }
            }}
            onCancelClick={() => {
              toggleModal();
            }}
            data={userToDelete}
            loading={isDeletingUser}
          />
        );
      case "delete-user-success":
        return (
          <ConfirmDeleteSuccessModal
            itemTitle={userToDelete?.itemTitle}
            onCloseClick={toggleModal}
          />
        );
      default:
        return null;
    }
  };

  /**@Effects */
  useEffect(() => {
    filterUsersByKeyword(searchKeyword);
  }, [searchKeyword]);

  return (
    <>
      <OuterPageWrapper>
        <div className="flex justify-between items-center">
          <H1 heading="All Users" />
          <IconButton
            Icon={BiPlus}
            iconProps={{ color: "#fff", size: "1rem" }}
            textStyle="text-[12px] font-inter text-white"
            containerStyle="flex space-x-2 rounded-full bg-[#008080] px-4 py-2 items-center"
            title="New user"
            onClick={createNewTableRow}
          />
        </div>
        <div className="flex w-full mt-6 justify-end border-b-[1px] border-[#0000004]">
          <div className="flex items-center pb-2">
            <FiSearch color="#00000060" size="1.2rem" />
            <input
              onChange={searchInputHandler}
              type="text"
              className="px-3 py-1 text-sm"
              placeholder="Search"
            />
          </div>
        </div>
        <UsersTable
          users={allUsers as any}
          updateTableFunction={setGetUsersParam}
          loading={loadingUsers}
          onClickRow={onUserRowClickHandler}
          onDeleteRow={openDeleteUserModal}
        />
      </OuterPageWrapper>
      <ModalWrap modalIsOpen={openModal} toggleModal={toggleModal}>
        {renderModal()}
      </ModalWrap>
    </>
  );
};

export const UsersPage = protectRoute({
  WrappedComponent: Component,
  allowedUser: "Admin",
  redirectTo: "/dashboard",
});
