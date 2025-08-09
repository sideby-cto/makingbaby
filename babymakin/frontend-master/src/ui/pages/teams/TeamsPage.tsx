import React from "react";
import {
  ConfigurationTableContainer,
  ConfirmDeleteSuccessModal,
  ConfirmDeletionModal,
  CreateOrEditOrganizationModal,
  CreateOrEditDistrictModal,
  CreateOrEditSchoolModal,
  CreateOrEditSchoolClassificationModal,
  CreateOrEditTeamModal,
  ModalWrap,
  H1,
  InnerPageWrapper,
  OuterPageWrapper,
} from "src/components";
import { useTeamsPage } from "../../../hooks/teams";
import { protectRoute } from "../../../utils";

const TeamsPageComponent: React.FC = () => {
  const {
    organizationModalConfig,
    districtModalConfig,
    schoolModalConfig,
    schoolClassificationModalConfig,
    teamModalConfig,
    modalContent,
    allOrganizations,
    isOrganizationsFetchLoading,
    allDistricts,
    isDistrictsFetchLoading,
    allSchools,
    isSchoolsFetchLoading,
    allSchoolClassifications,
    isSchoolClassificationsFetchLoading,
    allTeams,
    isTeamsFetchLoading,
    goals,
    isGoalsFetchLoading,
    promisingPractices,
    isPromisingPracticesFetchLoading,
    successSigns,
    isSuccessSignsFetchLoading,
    studentCharacteristics,
    isStudentCharacteristicsFetchLoading,
    onOrganizationRowClickHandler,
    onDistrictRowClickHandler,
    onSchoolRowClickHandler,
    onSchoolClassificationRowClickHandler,
    onTeamRowClickHandler,
    onDeleteClick,
    deleteMutateAsync,
    createNewTableRow,
    toggleModal,
    dataForDeleModal,
    openModal,
    refetchOrganizations,
    refetchDistricts,
    refetchSchools,
    refetchSchoolClassifications,
    refetchTeams,
  } = useTeamsPage();

  return (
    <OuterPageWrapper>
      <div className="mb-8">
        <H1 heading="Manage your teams" />
      </div>
      <InnerPageWrapper>
        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-or-edit-organization"
            ),
            data: !allOrganizations ? [] : allOrganizations,
            onDeleteClick,
            onRowClick: onOrganizationRowClickHandler,
            name: "Organizations",
            isLoading: isOrganizationsFetchLoading,
          }}
        />
        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-or-edit-district"
            ),
            data: !allDistricts ? [] : allDistricts,
            onDeleteClick,
            onRowClick: onDistrictRowClickHandler,
            name: "Districts",
            isLoading: isDistrictsFetchLoading,
          }}
        />
        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-or-edit-school"
            ),
            data: !allSchools ? [] : allSchools,
            onDeleteClick,
            onRowClick: onSchoolRowClickHandler,
            name: "Schools",
            isLoading: isSchoolsFetchLoading,
          }}
        />
        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-or-edit-school-classification"
            ),
            data: !allSchoolClassifications ? [] : allSchoolClassifications,
            onDeleteClick,
            onRowClick: onSchoolClassificationRowClickHandler,
            name: "School Classifications",
            isLoading: isSchoolClassificationsFetchLoading,
          }}
        />
        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-or-edit-team"
            ),
            data: !allTeams ? [] : allTeams,
            onDeleteClick,
            onRowClick: onTeamRowClickHandler,
            name: "Teams",
            isLoading: isTeamsFetchLoading,
          }}
        />
      </InnerPageWrapper>
      <ModalWrap modalIsOpen={openModal} toggleModal={toggleModal}>
        {modalContent === "delete-config-table-row" ? (
          <ConfirmDeletionModal
            onConfirmClick={() => {
              if (dataForDeleModal?._id) {
                deleteMutateAsync({
                  _id: dataForDeleModal._id,
                  route: dataForDeleModal.deleteRoute,
                });
              }
            }}
            onCancelClick={() => {
              toggleModal();
            }}
            data={dataForDeleModal}
          />
        ) : modalContent === "delete-config-table-row-success" ? (
          <ConfirmDeleteSuccessModal onCloseClick={toggleModal} />
        ) : modalContent === "create-or-edit-organization" ? (
          <CreateOrEditOrganizationModal
            type={organizationModalConfig?.type === "update" ? "update" : "create"}
            onCloseModalClick={toggleModal}
            populatedData={organizationModalConfig?.data}
            refetch={refetchOrganizations}
            isLoading={false}
          />
        ) : modalContent === "create-or-edit-district" ? (
          <CreateOrEditDistrictModal
            type={districtModalConfig?.type === "update" ? "update" : "create"}
            onCloseModalClick={toggleModal}
            populatedData={districtModalConfig?.data}
            refetch={refetchDistricts}
            isLoading={
              isGoalsFetchLoading ||
              isPromisingPracticesFetchLoading ||
              isSuccessSignsFetchLoading ||
              isStudentCharacteristicsFetchLoading
            }
            checkBoxData={{
              goals,
              promisingPractices,
              studentCharacteristics,
              successSigns,
            }}
            organizations={!allOrganizations ? [] : allOrganizations}
          />
        ) : modalContent === "create-or-edit-school" ? (
          <CreateOrEditSchoolModal
            type={schoolModalConfig?.type === "update" ? "update" : "create"}
            onCloseModalClick={toggleModal}
            populatedData={schoolModalConfig?.data}
            refetch={refetchSchools}
            isLoading={
              isGoalsFetchLoading ||
              isPromisingPracticesFetchLoading ||
              isSuccessSignsFetchLoading ||
              isStudentCharacteristicsFetchLoading
            }
            checkBoxData={{
              goals,
              promisingPractices,
              studentCharacteristics,
              successSigns,
            }}
            districts={!allDistricts ? [] : allDistricts}
            schoolClassifications={!allSchoolClassifications ? [] : allSchoolClassifications}
          />
        ) : modalContent === "create-or-edit-school-classification" ? (
          <CreateOrEditSchoolClassificationModal
            type={schoolClassificationModalConfig?.type === "update" ? "update" : "create"}
            onCloseModalClick={toggleModal}
            populatedData={schoolClassificationModalConfig?.data}
            refetch={refetchSchoolClassifications}
            isLoading={false}
          />
        ) : modalContent === "create-or-edit-team" ? (
          <CreateOrEditTeamModal
            type={teamModalConfig?.type === "update" ? "update" : "create"}
            onCloseModalClick={toggleModal}
            populatedData={teamModalConfig?.data}
            refetch={refetchTeams}
            isLoading={isGoalsFetchLoading}
            checkBoxData={{
              goals,
              promisingPractices,
              studentCharacteristics,
              successSigns,
            }}
          />
        ) : (
          "Hello Content"
        )}
      </ModalWrap>
    </OuterPageWrapper>
  );
};

export const TeamsPage = protectRoute({
  WrappedComponent: TeamsPageComponent,
  allowedUser: "Admin",
  redirectTo: "/dashboard",
});
