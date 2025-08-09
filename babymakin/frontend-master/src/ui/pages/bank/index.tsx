import {
  CreateOrEditGoalModal,
  ModalWrap,
  CreateOrEditSuccessSignModal,
  CreateOrEditPromisePracticeModal,
  ConfirmDeleteSuccessModal,
  ConfigurationTableContainer,
  CreateOrEditStdCharacteristicsModal,
  ConfirmDeletionModal,
} from "src/components";
import { useDataBank } from "../../../hooks";
import { protectRoute } from "../../../utils";

const DataBankPageComponent = () => {
  const {
    GoalModalConfig,
    PromisingPracticesConfig,
    successSignConfig,
    studentCharacteristicsConfig,
    modalContent,
    allGoals,
    allPromisingPractices,
    allSuccessSigns,
    allStudentCharacteristics,
    loadingGoals,
    loadingPromisingPractices,
    loadingStudentCharacteristics,
    loadingSuccessSigns,
    refetchGoals,
    refetchPromisingPractices,
    refetchStudentCharacteristics,
    refetchSuccessSigns,
    onGoalRowClickHandler,
    onPromisingPracticeRowClickHandler,
    onSuccessSignRowClickHandler,
    onStudentCharacteristicsRowClickHandler,
    onDeleteClick,
    deleteDataFunction,
    createNewTableRow,
    openModal,
    toggleModal,
    dataForDeleModal,
  } = useDataBank();

  return (
    <div className="p-10 flex-1 flex flex-col gap-[54px] overflow-y-auto h-full">
      <div className="flex flex-col gap-20">
        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-or-edit-goal"
            ),
            data: !allGoals ? [] : allGoals,
            onDeleteClick,
            onRowClick: onGoalRowClickHandler,
            name: "Goals",
            tableProps: { width: "45%", isSmall: true },
            isLoading: loadingGoals,
          }}
        />

        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-or-edit-promise-practice"
            ),
            data: !allPromisingPractices ? [] : allPromisingPractices,
            onDeleteClick,
            onRowClick: onPromisingPracticeRowClickHandler,
            name: "Promising Practices",
            tableProps: { width: "45%", isSmall: true },
            isLoading: loadingPromisingPractices,
          }}
        />

        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-or-edit-success-sign"
            ),
            data: !allSuccessSigns ? [] : allSuccessSigns,
            onDeleteClick,
            onRowClick: onSuccessSignRowClickHandler,
            name: "Success Signs",
            tableProps: { width: "45%", isSmall: true },
            isLoading: loadingSuccessSigns,
          }}
        />

        <ConfigurationTableContainer
          {...{
            createNewRowHandler: createNewTableRow.bind(
              this,
              "create-student-characteristic"
            ),
            data: !allStudentCharacteristics ? [] : allStudentCharacteristics,
            onDeleteClick,
            onRowClick: onStudentCharacteristicsRowClickHandler,
            name: "Student Characteristics",
            tableProps: { width: "45%", isSmall: true },
            isLoading: loadingStudentCharacteristics,
          }}
        />
      </div>

      <ModalWrap modalIsOpen={openModal} toggleModal={toggleModal}>
        {modalContent === "create-or-edit-goal" ? (
          <CreateOrEditGoalModal
            populatedData={GoalModalConfig?.data}
            type={GoalModalConfig?.type === "update" ? "update" : "create"}
            onCloseModalClick={toggleModal}
            refetch={refetchGoals}
          />
        ) : modalContent === "create-or-edit-success-sign" ? (
          <CreateOrEditSuccessSignModal
            populatedData={successSignConfig?.data}
            type={successSignConfig?.type === "update" ? "update" : "create"}
            onCloseModalClick={toggleModal}
            refetch={refetchSuccessSigns}
          />
        ) : modalContent === "create-or-edit-promise-practice" ? (
          <CreateOrEditPromisePracticeModal
            populatedData={PromisingPracticesConfig?.data}
            type={
              PromisingPracticesConfig?.type === "update" ? "update" : "create"
            }
            onCloseModalClick={toggleModal}
            refetch={refetchPromisingPractices}
          />
        ) : modalContent === "create-student-characteristic" ? (
          <CreateOrEditStdCharacteristicsModal
            type={
              studentCharacteristicsConfig?.type === "update"
                ? "update"
                : "create"
            }
            onCloseModalClick={toggleModal}
            refetch={refetchStudentCharacteristics}
            populatedData={studentCharacteristicsConfig?.data}
          />
        ) : modalContent === "delete-config-table-row" ? (
          <ConfirmDeletionModal
            onConfirmClick={() => {
              if (dataForDeleModal?._id) {
                deleteDataFunction({
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
          <ConfirmDeleteSuccessModal
            itemTitle={dataForDeleModal?.itemTitle}
            onCloseClick={toggleModal}
          />
        ) : (
          "Hello Content"
        )}
      </ModalWrap>
    </div>
  );
};

export const DataBankPage = protectRoute({
  WrappedComponent: DataBankPageComponent,
  redirectTo: "/dashboard",
  allowedUser: "Admin",
});
