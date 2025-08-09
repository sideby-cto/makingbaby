import { useState } from "react";
import { ENDPOINTS } from "../../api";
import { useCollections, useMutateCollections } from "../../utils";
import {
  ConfigurationModalContentType,
  ConfigurationNamesType,
  DataForDeleteModalType,
  ModalConfig,
} from "../../utils/types";

export const useDataBank = () => {
  const [GoalModalConfig, setGoalModalConfig] =
    useState<ModalConfig<"create-or-edit-goal"> | null>(null);
  const [PromisingPracticesConfig, setPromisingModalConfig] =
    useState<ModalConfig<"create-or-edit-promise-practice"> | null>(null);
  const [successSignConfig, setSuccessSignModalConfig] =
    useState<ModalConfig<"create-or-edit-success-sign"> | null>(null);
  const [studentCharacteristicsConfig, setStudentCharacteristicsConfig] =
    useState<ModalConfig<"create-or-edit-success-sign"> | null>(null);
  const [modalContent, setModalContent] =
    useState<ConfigurationModalContentType>("");
  const [openModal, setOpenModal] = useState(false);
  const [dataForDeleModal, setDataForDeleteModal] =
    useState<DataForDeleteModalType>(null);
  const { collectionLoadingStates, collections, refetchCollections } =
    useCollections();
  const {
    allGoals,
    allPromisingPractices,
    allSuccessSigns,
    allStudentCharacteristics,
  } = collections;
  const {
    loadingGoals,
    loadingPromisingPractices,
    loadingStudentCharacteristics,
    loadingSuccessSigns,
  } = collectionLoadingStates;
  const {
    refetchGoals,
    refetchPromisingPractices,
    refetchStudentCharacteristics,
    refetchSuccessSigns,
  } = refetchCollections;

  /**@DeleteLogic */
  const onDeleteSuccess = () => {
    setModalContent("delete-config-table-row-success");
    const condition = dataForDeleModal?.listTitle as ConfigurationNamesType;
    switch (condition) {
      case "Goals":
        refetchGoals();
        break;
      case "Promising Practices":
        refetchPromisingPractices();
        break;
      case "Success Signs":
        refetchSuccessSigns();
        break;
      case "Student Characteristics":
        refetchStudentCharacteristics();
        break;
    }
  };
  const { mutations, mutationStates } = useMutateCollections({
    onDeleteDataCallback: onDeleteSuccess,
  });
  const { deleteDataFunction } = mutations;
  const { isDeletingData: isDeleting } = mutationStates;

  /**@Handlers */
  const toggleModal = () => {
    setOpenModal(!openModal);
  };
  const createNewTableRow = (row: ConfigurationModalContentType) => {
    switch (row) {
      case "create-or-edit-goal":
        setModalContent(row);
        setGoalModalConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      case "create-or-edit-success-sign":
        setModalContent(row);
        setSuccessSignModalConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      case "create-or-edit-promise-practice":
        setModalContent(row);
        setPromisingModalConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      case "create-student-characteristic":
        setModalContent(row);
        setStudentCharacteristicsConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      default:
        return null;
    }
  };

  const onGoalRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-goal");
    setGoalModalConfig({ type: "update", data });
    toggleModal();
  };
  const onPromisingPracticeRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-promise-practice");
    setPromisingModalConfig({ type: "update", data });
    toggleModal();
  };
  const onSuccessSignRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-success-sign");
    setSuccessSignModalConfig({ type: "update", data });
    toggleModal();
  };
  const onStudentCharacteristicsRowClickHandler = (data: any) => {
    setModalContent("create-student-characteristic");
    setStudentCharacteristicsConfig({ type: "update", data });
    toggleModal();
  };

  const onDeleteClick = (data: any) => {
    const condition = data.listTitle as ConfigurationNamesType;

    switch (condition) {
      case "Goals":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "Goals",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.goals,
        });

        break;
      case "Promising Practices":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "Promising Practices",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.promisingPractice,
        });
        break;
      case "Success Signs":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "Success Signs",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.studentSuccessSign,
        });
        break;
      case "Student Characteristics":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "Student Characteristics",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.studentCharacteristics,
        });
        break;
    }
    setModalContent("delete-config-table-row");
    toggleModal();
  };
  return {
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
  };
};
