/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Toastify, useSelector } from "../../utils";
import { SmallWinsStoryType } from "../../utils/types";
import { useUserGlobalState } from "../useUserGlobalState";
import { useSearchParams } from "react-router-dom";
import { Mutations, Queries } from "../../api";
import { useMutation } from "@tanstack/react-query";
import { storyIsEditable as canEditStory } from "../../core";

interface IStory {
  Insights: number;
  author: any;
  createdAt: string;
  files: [];
  high5s: number;
  likes: number;
  promisingPractices: any[];
  studentCharacteristics: any[];
  successSigns: any[];
  type: "SW" | "LL";
  updatedAt: string;
  school: string;
  goal: string;
  storyAction: string;
  storyExperience: string;
  storyObservation: string;
}

const sortAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.name.localeCompare(a.name));
};

export const useCreateStory = () => {
  const user = useUserGlobalState()[0];
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openDeleteStoryModal, setOpenDeleteStoryModal] = useState(false);
  const { value: schoolOptions, selectorFunction: setSchoolOptions } =
    useSelector<any>([]);
  const { value: goalOptions, selectorFunction: setGoalOptions } =
    useSelector<any>([]);
  const [storyType, setStoryType] = useState<SmallWinsStoryType>("Success");
  const [defaultStory, setDefaultStory] = useState<IStory>();
  const [school, setSchool] = useState("");
  const [goal, setGoal] = useState<undefined | string>();
  const selectorOptions = schoolOptions ?? [];

  const selectStoryType = (e: any) => {
    const { value } = e.target;
    setStoryType(value);
  };
  const selectSchool = (schoolId: string) => {
    setSchool(schoolId);
    setGoal("");
  };
  const selectGoal = (goalId: string) => {
    setGoal(goalId);
  };

  useEffect(() => {
    if (
      user?.schools &&
      (user?.schools?.length || []) === 1 &&
      user?.schools[0]
    ) {
      selectSchool(user?.schools[0]._id);
    }
    // in a perfect world, all of the data
    // would be loaded _before_ this component
    // is rendered. That being said, this
    // will check for when this prop changes,
    // and select the school if there is only
    // that the user is associated with.
  }, [user?.schools]);

  const toggleModal = () => setOpenSuccessModal(!openSuccessModal);
  const toggleDeleteStoryModal = () =>
    setOpenDeleteStoryModal(!openDeleteStoryModal);

  const onDeleteStorySuccess = () => {
    Toastify("success", "Successfully deleted story");
    // navigate("/dashboard")
  };
  const onDeleteStoryFailed = () => {
    Toastify("error", "Failed to deleted story");
    // navigate("/dashboard")
  };

  const onClickCancelDelete = () => {
    setOpenDeleteStoryModal(false);
  };

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["delete-story"],
    mutationFn: Mutations.deleteStory,
    onSuccess: onDeleteStorySuccess,
    onError: onDeleteStoryFailed,
  });

  useEffect(() => {
    (async () => {
      try {
        const pageFeature = searchParams.get("feature");
        const storyId = searchParams.get("id");
        if (pageFeature === "edit" && storyId) {
          if (user) {
            const story = await Queries.getStory(storyId);
            const storyIsEditable = canEditStory(user, story);
            if (storyIsEditable) {
              setSchool(story.school);
              setStoryType(story.type === "SW" ? "Success" : "Lesson Learned");
              setDefaultStory(story);
              return "edit";
            } else {
              throw new Error("User not allowed to edit story");
            }
          }
        } else {
          throw new Error("Story not found");
        }
      } catch (error) {
        setDefaultStory(undefined);
        setSearchParams(new URLSearchParams([["feature", "new"]]));
      }
    })();
  }, [user, searchParams]);

  useEffect(() => {
    if (user && user?.schools) {
      sortAlphabetically(user.schools);
      setSchoolOptions(user.schools);
    }
  }, [user]);

  return {
    openSuccessModal,
    user,
    storyType,
    school,
    goal,
    selectorOptions,
    selectStoryType,
    selectSchool,
    selectGoal,
    toggleModal,
    defaultStory,
    openDeleteStoryModal,
    deleteStory: mutateAsync,
    onClickCancelDelete,
    isDeletingStory: isPending,
    toggleDeleteStoryModal,
  };
};
