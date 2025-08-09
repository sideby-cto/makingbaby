import React from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { SmallWinsStoryType } from "../../utils/types";
import { FormSubmitButton } from "../buttons";
import { ScrollableMultiSelect } from "../inputs";
import { MentionData, StoryTextBox } from "./StoryTextBox";
import { useStoryForms } from "../../hooks";
import { RenderCondition } from "../../ui/lib";

interface SmallWinsFormsContainerProps {
  storyType: SmallWinsStoryType;
  school?: string;
  goal?: string;
  onCreateStoryFunction: () => void;
  reset?: boolean;
  defaultStory?: any;
  onClickDeleteStory?: () => void;
}

export const SmallWinsFormsContainer: React.FC<SmallWinsFormsContainerProps> = (
  props
) => {
  const {
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
    user,
    storyHasAuthor,
    storyAction,
    storyExperience,
    storyObservation,
    setStoryAction,
    uploadInputRef,
    practicesOptions,
    characteristicsOptions,
    signsOptions,
    storyType,
    isCreatingStory,
    isEditingStory,
    feature,
    isDeletingStory,
    deleteStoryHandler,
    onTaggedUsersChange,
  } = useStoryForms({
    schoolId: props.school ?? "",
    goalId: props.goal ?? "",
    ...props,
  });

  const handleTaggedUsersChange = (taggedUsers: MentionData[]) => {
    onTaggedUsersChange(taggedUsers);
  };

  return (
    <>
      <div className="flex flex-col w-full mt-6">
        <h2 className="text-sm font-interBold text-defaultText">
          Tell the Story
        </h2>
        <StoryTextBox
          errorMessage={
            !(storyAction || storyExperience || storyObservation)
              ? "Use prompts to describe a specific instance."
              : ""
          }
          title="Describe your story"
          action={storyAction}
          actionHandler={setStoryAction}
          storyType={storyType}
          schoolId={props.school}
          userId={user?.id}
          onTaggedUsersChange={handleTaggedUsersChange}
        />
      </div>

      {/**Upload Artifact */}
      <div className="flex flex-col space-y-5 mt-6">
        <h2 className="text-sm font-interBold text-defaultText">
          Add Artifacts or Images
          <p className="text-xs font-inter pt-2">
            (Acceptable file types: .img, .txt, .rtf, .pdf, .doc, .docx, .ppt,
            .pptx, .xls, .xlsx, .mp4, .mov)
          </p>
        </h2>
        <button
          onClick={openLocalStoragePath}
          className="flex flex-col px-2 w-52 h-16 rounded-lg bg-gray-100 justify-center items-center overflow-hidden"
        >
          <input
            id="file"
            type="file"
            name="fileToUpload"
            accept="image/*,
                  text/plain,
                  application/rtf,
                  application/pdf,
                  application/vnd.ms-word,
                  application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                  application/vnd.ms-powerpoint,
                  application/vnd.openxmlformats-officedocument.presentationml.presentation,
                  application/vnd.ms-excel,
                  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                  video/mp4,
                  video/quicktime"
            className="hidden"
            multiple
            ref={uploadInputRef}
            onChange={changeUploadedFileHandler}
          />
          <FaCloudUploadAlt color="#B93160" size="1.4rem" />
          <p className="text-xs text-[#000]/50 font-interMedium line-clamp-2">
            {selectedFileName ? selectedFileName : "Choose file(s)"}
          </p>
        </button>
        {selectedFileName && (
          <button
            onClick={removeAttachments}
            className="text-xs text-red-400 font-interMedium w-fit"
          >
            Remove File
            <span>
              {(uploadInputRef.current?.files?.length ?? 0) > 1 ? "s" : ""}
            </span>
          </button>
        )}
      </div>
      {/**Story Tag Drop downs */}
      <div className="flex flex-col pt-5">
        <h2 className="text-sm font-interBold text-defaultText">Add Tags</h2>
        <div className="flex flex-col lg:flex-row w-full flex-nowrap lg:flex-wrap gap-6">
          <ScrollableMultiSelect
            title={
              storyType === "Lesson Learned"
                ? "Main Practice(s) Attempted:"
                : "Main Practice(s) Used:"
            }
            options={practicesOptions ?? []}
            values={promisingPractices}
            onSelectHandler={selectPromisingPractice}
            selectedKey="_id"
          />
          <ScrollableMultiSelect
            title={
              storyType === "Lesson Learned"
                ? "Main Sign(s) Desired:"
                : "Main Sign(s) Observed:"
            }
            options={signsOptions ?? []}
            values={successSigns}
            onSelectHandler={selectSuccessSigns}
            selectedKey="_id"
          />
          <ScrollableMultiSelect
            title={
              storyType === "Lesson Learned"
                ? "Hoped to Observe Sign(s) In:"
                : "Sign(s) Most Observed In:"
            }
            options={characteristicsOptions ?? []}
            values={studentCharacteristics}
            onSelectHandler={selectStudentCharacteristics}
            selectedKey="_id"
          />
        </div>
        <div className="my-6 space-y-1">
          <h4 className="text-sm font-interBold">Posted By: </h4>
          <div className="flex items-center space-x-2">
            <input
              onChange={onChangePostedUser}
              type="radio"
              name="postedBy"
              id="customUser"
              checked={postedBy === (user as any)?.id}
            />
            <label htmlFor="customUser">Me</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              onChange={onChangePostedUser}
              type="radio"
              name="postedBy"
              id="anonymous"
              checked={postedBy === "anonymous"}
            />
            <label htmlFor="anonymous">Anonymous</label>
          </div>
          <p className="text-xs text-red-400 font-inter">
            {!storyHasAuthor ? "Add the author of your story" : ""}
          </p>
        </div>
      </div>
      {RenderCondition(
        feature === "edit",
        <div className="w-full flex gap-x-10">
          <FormSubmitButton
            onClick={submitForm}
            title="Edit Story"
            containerStyle="w-80 lg:w-60 h-fit shrink-0 box-border py-3 px-0 lg:px-12 rounded-lg bg-[#008080] text-white font-interMedium"
            loading={isEditingStory}
          />
          <FormSubmitButton
            onClick={deleteStoryHandler}
            title="Delete"
            containerStyle="w-80 lg:w-60 py-3 shrink-0 px-0 lg:px-10 rounded-lg bg-red-400 text-white font-interMedium"
            loading={isDeletingStory}
          />
        </div>,
        <FormSubmitButton
          onClick={submitForm}
          title="Submit"
          containerStyle="w-80 lg:w-fit shrink-0  py-3 px-0 lg:px-12 rounded-lg bg-[#008080] text-white font-interMedium"
          loading={isCreatingStory}
        />
      )}
    </>
  );
};
