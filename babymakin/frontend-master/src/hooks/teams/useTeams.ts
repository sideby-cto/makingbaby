import { useMutation, useQueries } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { ENDPOINTS, Mutations, Queries } from "../../api";
import {
  ConfigurationModalContentType,
  ConfigurationNamesType,
  DataForDeleteModalType,
  ModalConfig,
} from "../../utils/types";

export const useTeamsPage = () => {
  const [organizationModalConfig, setOrganizationModalConfig] =
    useState<ModalConfig<"create-or-edit-organization"> | null>(null);
  const [districtModalConfig, setDistrictModalConfig] =
    useState<ModalConfig<"create-or-edit-district"> | null>(null);
  const [schoolModalConfig, setSchoolModalConfig] =
    useState<ModalConfig<"create-or-edit-school"> | null>(null);
  const [schoolClassificationModalConfig, setSchoolClassificationModalConfig] =
    useState<ModalConfig<"create-or-edit-school-classification"> | null>(null);
  const [teamModalConfig, setTeamModalConfig] =
    useState<ModalConfig<"create-or-edit-team"> | null>(null);
  const [modalContent, setModalContent] =
    useState<ConfigurationModalContentType>("");
  const [openModal, setOpenModal] = useState(false);
  const [dataForDeleModal, setDataForDeleteModal] =
    useState<DataForDeleteModalType>(null);
  const [
    {
      data: allOrganizations,
      isLoading: isOrganizationsFetchLoading,
      refetch: refetchOrganizations,
    },
    {
      data: allDistricts,
      isLoading: isDistrictsFetchLoading,
      refetch: refetchDistricts,
    },
    {
      data: allSchools,
      isLoading: isSchoolsFetchLoading,
      refetch: refetchSchools,
    },
    {
      data: allSchoolClassifications,
      isLoading: isSchoolClassificationsFetchLoading,
      refetch: refetchSchoolClassifications,
    },
    { data: allTeams, isLoading: isTeamsFetchLoading, refetch: refetchTeams },
    { data: goals, isLoading: isGoalsFetchLoading },
    { data: promisingPractices, isLoading: isPromisingPracticesFetchLoading },
    { data: successSigns, isLoading: isSuccessSignsFetchLoading },
    {
      data: studentCharacteristics,
      isLoading: isStudentCharacteristicsFetchLoading,
    },
  ] = useQueries({
    queries: [
      {
        queryKey: ["organizations"],
        queryFn: Queries.getOrganizations,
      },
      {
        queryKey: ["districts"],
        queryFn: Queries.getDistricts,
      },
      {
        queryKey: ["schools"],
        queryFn: Queries.getSchools,
      },
      {
        queryKey: ["school-classifications"],
        queryFn: Queries.getSchoolClassifications,
      },
      {
        queryKey: ["teams"],
        queryFn: Queries.getTeams,
      },
      {
        queryKey: ["goals"],
        queryFn: Queries.getGoals,
      },
      {
        queryKey: ["promising-practices"],
        queryFn: Queries.getPromisingPractices,
      },
      {
        queryKey: ["success-signs"],
        queryFn: Queries.getSuccessSigns,
      },
      {
        queryKey: ["student-characteristics"],
        queryFn: Queries.getStdCharacteristics,
      },
    ],
  });

  const mutateOptions = {
    onError: (error: AxiosError) => {
      console.error(`${error.message}, Please try again!`, {
        className: "text-red-600",
      });
    },
    onSuccess: () => {
      setModalContent("delete-config-table-row-success");
      const condition = dataForDeleModal?.listTitle as ConfigurationNamesType;
      switch (condition) {
        case "Organizations":
          refetchOrganizations();
          break;
        case "Districts":
          refetchDistricts();
          break;
        case "Schools":
          refetchSchools();
          break;
        case "School Classifications":
          refetchSchoolClassifications();
          break;
        case "Teams":
          refetchTeams();
          break;
      }
    },
  };

  // mutate for creating a new batch
  const { mutateAsync: deleteMutateAsync, isPending: isDeleting } = useMutation(
    {
      mutationFn: Mutations.deleteData,
      ...mutateOptions,
    }
  );

  /**@Handlers */
  const createNewTableRow = (row: ConfigurationModalContentType) => {
    switch (row) {
      case "create-or-edit-organization":
        setModalContent(row);
        setOrganizationModalConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      case "create-or-edit-district":
        setModalContent(row);
        setDistrictModalConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      case "create-or-edit-team":
        setModalContent(row);
        setTeamModalConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      case "create-or-edit-school":
        setModalContent(row);
        setSchoolModalConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      case "create-or-edit-school-classification":
        setModalContent(row);
        setSchoolClassificationModalConfig({ type: "create", data: {} as any });
        toggleModal();
        break;
      default:
        return null;
    }
  };

  const onOrganizationRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-organization");
    setOrganizationModalConfig({ type: "update", data });
    toggleModal();
  };
  const onDistrictRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-district");
    setDistrictModalConfig({ type: "update", data });
    toggleModal();
  };
  const onSchoolRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-school");
    setSchoolModalConfig({ type: "update", data });
    toggleModal();
  };
  const onSchoolClassificationRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-school-classification");
    setSchoolClassificationModalConfig({ type: "update", data });
    toggleModal();
  };
  const onTeamRowClickHandler = (data: any) => {
    setModalContent("create-or-edit-team");
    setTeamModalConfig({ type: "update", data });
    toggleModal();
  };

  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  const onDeleteClick = (data: any) => {
    const condition = data.listTitle as ConfigurationNamesType;

    switch (condition) {
      case "Organizations":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "Organizations",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.organizations,
        });
        break;
      case "Districts":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "Districts",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.districts,
        });
        break;
      case "Schools":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "Schools",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.schools,
        });
        break;
      case "School Classifications":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "School Classifications",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.schoolClassifications,
        });
        break;
      case "Teams":
        setDataForDeleteModal({
          _id: data.rowData._id,
          listTitle: "Teams",
          itemTitle: data.rowData.name,
          loading: isDeleting,
          deleteRoute: ENDPOINTS.teams,
        });
        break;
    }
    setModalContent("delete-config-table-row");
    toggleModal();
  };

  return {
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
    openModal,
    toggleModal,
    dataForDeleModal,
    refetchOrganizations,
    refetchDistricts,
    refetchSchools,
    refetchSchoolClassifications,
    refetchTeams,
  };
};
