import React from "react";
import { useCreateStory } from "../../../hooks";
import { ProIcons } from "../../../assets/icons";

import {
  FormSubmitButton,
  ModalWrap,
  Select,
  SmallWinsFormsContainer,
} from "../../../components";
import { protectRoute } from "../../../utils";
import { SmallWinsStoryType } from "../../../utils/types";
import { SchoolType } from "../../../core";
import { RenderIf } from "../../lib";

const StoryType: SmallWinsStoryType[] = ["Success", "Lesson Learned"];

const CreateStoryPageComponent: React.FC = () => {
  const {
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
    deleteStory,
    onClickCancelDelete,
    openDeleteStoryModal,
    isDeletingStory,
    toggleDeleteStoryModal,
  } = useCreateStory();

  const selectedSchool = (user?.schools || []).find(
    (userSchool) => userSchool._id === school
  );
  const schoolGoals = selectedSchool?.schoolGoals || [];

  return (
    <div className="p-10 overflow-y-auto w-full bg-white flex flex-col space-y-5 pt-5 lg:mt-0 h-full">
      <h1 className="font-interBold text-2xl text-defaultText">
        Create a Small Win Story
      </h1>
      <div className="flex flex-col lg:flex-row w-full flex-nowrap lg:flex-wrap gap-6">
        {RenderIf(
          ["School Leader", "Staff Member", "Organization Leader"].includes(
            user?.permissionLevel ?? "none"
          ),
          <div className="w-full lg:w-[30%]">
            <Select
              options={
                user?.schools && Array.isArray(user?.schools)
                  ? user?.schools.map((sch: SchoolType) => ({
                      label: sch.name,
                      value: sch._id,
                    }))
                  : []
              }
              onChange={(e) => selectSchool(e.target.value)}
              label="School"
              value={school}
              name="school"
              placeholder="-"
              labelClassName="text-sm font-interBold text-defaultText "
            />
            {!school && (
              <p className="text-xs text-red-400 font-inter pt-2">
                Select a School first.
              </p>
            )}
          </div>
        )}
        {RenderIf(
          user?.permissionLevel === "District Leader",
          <div className="w-full lg:w-[30%]">
            <Select
              options={
                selectorOptions
                  ? selectorOptions.map((district: any) => ({
                      label: district.name,
                      value: district._id,
                    }))
                  : []
              }
              onChange={(e) => selectSchool(e.target.value)}
              label="School"
              value={school}
              name="school"
              placeholder="-"
              labelClassName="text-sm font-interBold text-defaultText"
            />
            {!school && (
              <p className="text-xs text-red-400 font-inter pt-2">
                Select a School first.
              </p>
            )}
          </div>
        )}
        <div className="w-full lg:w-[30%]">
          <Select
            options={schoolGoals.map(({ goal: { name, _id } }) => ({
              label: name,
              value: _id,
            }))}
            onChange={(e) => selectGoal(e.target.value)}
            label="Related Goal"
            value={goal}
            name="goal"
            placeholder="-"
            labelClassName="text-sm font-interBold text-defaultText"
          />
        </div>
        <div className="w-full lg:w-[30%]">
          <Select
            options={StoryType.map((storyType) => ({
              label:
                storyType === "Success"
                  ? "Success (Worked)"
                  : "Lesson Learned (Didn't Work)",
              value: storyType,
            }))}
            label="Type of Win"
            onChange={selectStoryType}
            value={storyType}
            name="storyType"
            allowNoneOption
            labelClassName="text-sm font-interBold text-defaultText"
          />
        </div>
      </div>
      {RenderIf(
        !!storyType,
        <SmallWinsFormsContainer
          storyType={storyType as SmallWinsStoryType}
          school={school}
          goal={goal}
          onCreateStoryFunction={toggleModal}
          reset={openSuccessModal}
          defaultStory={defaultStory}
          onClickDeleteStory={toggleDeleteStoryModal}
          key={JSON.stringify(defaultStory)} // to force re-render when default story changes ie when we force the feature from edit to new
        />
      )}
      <ModalWrap modalIsOpen={openSuccessModal} toggleModal={toggleModal}>
        <div className="w-full h-full flex flex-col space-y-3 justify-center items-center">
          <img src={ProIcons.ProWelcome} alt="" className="h-20 w-20" />
          <h2 className="text-xl font-interBold text-defaultText">
            Thank you for your wonderful story
          </h2>
        </div>
        <FormSubmitButton
          onClick={toggleModal}
          title="Back to App"
          containerStyle="w-full mt-10 h-10 rounded-md bg-[#008080] flex justify-center items-center font-interBold text-sm text-white"
        />
      </ModalWrap>

      <ModalWrap modalIsOpen={openDeleteStoryModal} toggleModal={toggleModal}>
        <div className="w-full h-full flex flex-col space-y-3 justify-center items-center">
          <h2 className="text-xl font-interBold text-red-400">
            Proceed to delete story?
          </h2>
        </div>
        <div className="w-full mt-10 lg:mt-0 flex flex-col gap-y-6 lg:flex-row lg:gap-y-0 lg:justify-between">
          <FormSubmitButton
            onClick={deleteStory}
            title="Delete"
            containerStyle="w-full lg:w-fit px-12 py-4 rounded-md bg-red-500 flex justify-center items-center font-interBold text-sm text-white"
            loading={isDeletingStory}
          />
          <FormSubmitButton
            onClick={onClickCancelDelete}
            title="Cancel"
            containerStyle="w-full lg:w-fit px-12 py-4 rounded-md bg-[#a9a9a9] flex justify-center items-center font-interBold text-sm text-white"
          />
        </div>
      </ModalWrap>
    </div>
  );
};

export const CreateStoryPage = protectRoute({
  WrappedComponent: CreateStoryPageComponent,
  blockedUser: "Admin",
  redirectTo: "/dashboard",
});
