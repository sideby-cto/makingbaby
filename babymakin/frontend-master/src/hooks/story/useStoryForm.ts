/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery } from "@tanstack/react-query";
import { Queries } from "../../api";
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ExtractDataFromTeamGoals,
  Toastify,
  _useMutateCollections,
  useSelector,
  useSyntheticEventSelector,
} from "../../utils";
import { useUserGlobalState } from "../useUserGlobalState";
import { SmallWinsStoryType } from "../../utils/types";
import { validateStory } from "../../core";
import { createStoryForm, createUpdateStoryParams } from "../../application";
import { useNavigate } from "react-router-dom";
import { MentionData } from "src/components/containers/StoryTextBox";
import { MixPanel } from "../../utils/mixPanel/mixPanel";
import { EventNames } from "../../utils/mixPanel/trackUtils";
import { sum } from "lodash";

interface Props {
  schoolId: string;
  goalId: string;
  storyType: SmallWinsStoryType;
  onCreateStoryFunction: () => void;
  defaultStory?: any;
}

const getIdsFromList = (data: any[]) => {
  return data.map((doc) => doc._id) ?? [];
};

const sortAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.name.localeCompare(a.name));
};

export const useStoryForms = ({
  schoolId,
  goalId,
  storyType,
  onCreateStoryFunction,
  defaultStory,
}: Props) => {
  const navigate = useNavigate();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const user = useUserGlobalState()[0];
  const [taggedUsersId, setTaggedUsers] = useState<MentionData[]>([]);

  const onTaggedUsersChange = (users: MentionData[]) => {
    setTaggedUsers(users);
  };

  const { value: goalOptions, selectorFunction: setGoals } = useSelector<any[]>(
    []
  );

  const {
    value: practicesOptions,
    selectorFunction: setPromisingPracticeTags,
  } = useSelector<any[]>([]);

  const {
    value: characteristicsOptions,
    selectorFunction: setStudentCharacteristicTags,
  } = useSelector<any[]>([]);
  const { value: signsOptions, selectorFunction: setSuccessSignTags } =
    useSelector<any[]>([]);
  const { value: storyAction, setFunction: setStoryAction } =
    useSyntheticEventSelector("");
  const { value: storyObservation, setFunction: setStoryObservation } =
    useSyntheticEventSelector("");
  const { value: storyExperience, setFunction: setStoryExperience } =
    useSyntheticEventSelector("");

  const [postedBy, setPostedBy] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) setPostedBy(user.id);
    // ideally the data would already have been loaded
    // when this component is rendered, but since it may
    // not have been, here we check for whether this value
    // changes and then set state if it exists.
  }, [user?.id]);

  const [successSigns, setSuccessSigns] = useState<string[]>([]);
  const [promisingPractices, setPromisingPractices] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [studentCharacteristics, setStudentCharacteristics] = useState<
    string[]
  >([]);

  const onCreatedStory = () => {
    onCreateStoryFunction();
    setStoryAction("");
    setStoryObservation("");
    setStoryExperience("");
    setSuccessSigns([]);
    setPromisingPractices([]);
    setStudentCharacteristics([]);
    setPostedBy(null);
    setSelectedFileName("");
  };

  const onUpdateStorySuccess = () => {
    Toastify("success", "Story updated successfully");
    navigate("/dashboard");
  };

  const onDeleteStorySuccess = () => {
    Toastify("success", "Story deleted successfully");
    navigate("/create-story?feature=new");
  };

  const { refetch, data: schoolData } = useQuery({
    queryFn: () => Queries.getSchool(schoolId),
    queryKey: ["get-school-info", schoolId],
    enabled: false,
  });

  useEffect(() => {
    if (goalId || schoolData) {
      const schoolGoals = schoolData?.schoolGoals;

      const {
        allPromisingPractices,
        allStudentCharacteristics,
        allSuccessSigns,
        allGoals,
      } = ExtractDataFromTeamGoals({
        goals: schoolGoals,
        selectedGoalId: goalId,
      });

      sortAlphabetically(allGoals);
      sortAlphabetically(allPromisingPractices);
      sortAlphabetically(allSuccessSigns);
      sortAlphabetically(allStudentCharacteristics);
      setGoals(allGoals);
      setPromisingPracticeTags(allPromisingPractices);
      setSuccessSignTags(allSuccessSigns);
      setStudentCharacteristicTags(allStudentCharacteristics);
    }
  }, [schoolData, goalId]);

  const { handler: createStoryFunction, isPending: isCreatingStory } =
    _useMutateCollections({
      mutation: "createStory",
      successCallback: onCreatedStory,
      errorMessage: "Failed to create story",
    });
  const { handler: editStory, isPending: isEditingStory } =
    _useMutateCollections({
      mutation: "editStory",
      successCallback: onUpdateStorySuccess,
      errorMessage: "Failed to edit story",
    });
  const { handler: deleteStory, isPending: isDeletingStory } =
    _useMutateCollections({
      mutation: "deleteStory",
      successCallback: onDeleteStorySuccess,
      errorMessage: "Failed to Delete story",
    });

  const feature = useMemo(() => {
    return Boolean(defaultStory) ? "edit" : "new";
  }, [defaultStory]);

  const storyHasTags = useMemo(() => {
    return (
      successSigns.length > 0 &&
      studentCharacteristics.length > 0 &&
      promisingPractices.length > 0
    );
  }, [successSigns, studentCharacteristics, promisingPractices, storyType]);

  const storyHasAuthor = postedBy;

  const openLocalStoragePath = () => {
    const { current } = uploadInputRef;
    if (current) {
      current.click();
    }
  };
  const selectSuccessSigns = (data: any) => {
    const isSelected = successSigns.some((itm) => itm === data);
    if (!isSelected && successSigns.length < 3) {
      setSuccessSigns([...successSigns, data]);
      return;
    }
    const filteredData = successSigns.filter((itm) => data !== itm);
    setSuccessSigns(filteredData);
  };

  const selectPromisingPractice = (data: any) => {
    const isSelected = promisingPractices.some((itm) => itm === data);
    if (!isSelected && promisingPractices.length < 3) {
      setPromisingPractices([...promisingPractices, data]);
      return;
    }
    const filteredData = promisingPractices.filter((itm) => data !== itm);
    setPromisingPractices(filteredData);
  };

  const selectStudentCharacteristics = (data: any) => {
    const isSelected = studentCharacteristics.some((itm) => itm === data);
    const allStudentsId = characteristicsOptions?.find(
      (itm) => itm.name.trim() === "All Students"
    )?._id;
    if (!isSelected && data === allStudentsId) {
      // If the user selects "All Students", remove all other selections
      setStudentCharacteristics([allStudentsId]);
      return;
    }
    if (!isSelected && studentCharacteristics.length < 3) {
      // If the user selects a different characteristic, remove "All Students" and add the new selection
      const filteredData = studentCharacteristics.filter(
        (itm) => itm !== allStudentsId
      );
      setStudentCharacteristics([...filteredData, data]);
      return;
    }
    // If the user deselects a characteristic, remove it from the list
    const filteredData = studentCharacteristics.filter((itm) => data !== itm);
    setStudentCharacteristics(filteredData);
  };

  const removeAttachments = () => {
    uploadInputRef.current!.value = "";
    setSelectedFileName("");
  };

  const convertBytesToMb = (bytes: number) => bytes / 1048576;

  const changeUploadedFileHandler = (e: SyntheticEvent) => {
    const { files } = e.target as HTMLInputElement;

    const fileSizes = Array.from(files || []).map((file) =>
      convertBytesToMb(file.size)
    );

    const anyFilesAreGreaterThan200Mb = fileSizes.some(
      (fileSize) => fileSize > 200
    );

    if (anyFilesAreGreaterThan200Mb) {
      Toastify("warn", "Unable to upload files larger than 200MB");
      return;
    }

    if (files && files.length > 3) {
      Toastify("warn", "Please select a maximum of 3 files");
      return;
    }
    let filename = "";
    if (files && files?.length > 0) {
      for (const file of Array.from(files)) {
        filename += file.name + " ";
      }
    }
    setSelectedFileName(filename);
  };

  const onChangePostedUser = (e: any) => {
    const { id } = e.target as HTMLInputElement;
    if (id === "anonymous") {
      setPostedBy("anonymous");
    } else if (id === "customUser") {
      setPostedBy(user && (user as any).id);
    }
  };

  const deleteStoryHandler = () => {
    deleteStory({
      id: defaultStory?._id,
    } as any);
  };

  const submitForm = () => {
    try {
      const storyValidated = validateStory(
        schoolId,
        postedBy,
        successSigns,
        promisingPractices,
        studentCharacteristics,
        storyType,
        storyAction,
        storyObservation,
        storyExperience
      ); // add error handling

      if (storyValidated) {
        if (feature === "edit") {
          const updateStoryForm = createUpdateStoryParams(
            schoolId,
            postedBy,
            successSigns,
            promisingPractices,
            studentCharacteristics,
            storyType,
            storyAction!,
            storyObservation!,
            storyExperience!,
            user,
            taggedUsersId,
            uploadInputRef.current?.files ?? []
          );
          return editStory({
            id: defaultStory?._id,
            params: updateStoryForm,
          } as any);
        }

        const newStoryForm = createStoryForm(
          schoolId,
          postedBy,
          successSigns,
          promisingPractices,
          studentCharacteristics,
          storyType,
          storyAction!,
          storyObservation!,
          storyExperience!,
          user,
          taggedUsersId,
          uploadInputRef.current?.files ?? []
        );
        createStoryFunction(newStoryForm as any);
        MixPanel.track(EventNames.storySubmitted);
      }
    } catch (error: any) {
      Toastify("error", error?.message);
    }
  };

  useEffect(() => {
    if (schoolId) {
      refetch();
    }
  }, [schoolId, refetch]);

  useEffect(() => {
    if (schoolData && defaultStory) {
      const {
        storyAction,
        storyExperience,
        storyObservation,
        author,
        promisingPractices,
        studentCharacteristics,
        successSigns,
      } = defaultStory;
      setStoryAction(storyAction);
      setStoryExperience(storyExperience);
      setStoryObservation(storyObservation);
      setPromisingPractices(getIdsFromList(promisingPractices));
      setSuccessSigns(getIdsFromList(successSigns));
      setStudentCharacteristics(getIdsFromList(studentCharacteristics));
      setPostedBy(author?._id ?? "anonymous");
    }
  }, [schoolData, defaultStory]);

  return {
    openLocalStoragePath,
    changeUploadedFileHandler,
    selectedFileName,
    removeAttachments,
    successSigns,
    selectSuccessSigns,
    promisingPractices,
    selectPromisingPractice,
    studentCharacteristics,
    selectStudentCharacteristics,
    onChangePostedUser,
    postedBy,
    submitForm,
    isCreatingStory,
    deleteStory,
    isDeletingStory,
    isEditingStory,
    storyHasAuthor,
    user,
    storyAction,
    storyExperience,
    storyObservation,
    setStoryAction,
    setStoryExperience,
    setStoryObservation,
    uploadInputRef,
    storyType,
    practicesOptions,
    characteristicsOptions,
    signsOptions,
    storyHasTags,
    feature,
    deleteStoryHandler,
    taggedUsersId,
    onTaggedUsersChange,
  };
};
