/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from "react";
import { AiFillLike, AiOutlineLike, AiTwotoneEdit } from "react-icons/ai";
import { FaUserSecret } from "react-icons/fa";
import { GrFormAttachment } from "react-icons/gr";
import { HiLightBulb, HiOutlineLightBulb } from "react-icons/hi";
import { ProIcons } from "../../assets/icons";
import { COLORS } from "src/design-system";
import { assignColorToStoryTags } from "../../story";
import {
  endsWithChar,
  getDateFormatForStory,
  useGetStoryData,
  _useMutateCollections,
} from "../../utils";
import { StoryAttachmentViewer } from "./story_attachment_viewer/StoryAttachmentViewer";
import { StoryReactionPayload, StoryType } from "../../utils/types";
import { BaseIcon } from "../shared";
import { useStory } from "../../hooks";
import { RenderIf } from "../../ui/lib";
import { useUserGlobalState } from "../../hooks/useUserGlobalState";

interface Props {
  data: StoryType;
  onClick?: Function;
}

export const AdminCustomStoryContainer: React.FC<Props> = (props) => {
  const user = useUserGlobalState()[0];
  const { data } = props;
  const { storyIsEditable, onClickEditStory } = useStory(props);

  /**
   * Story VARIABLES
   */
  const {
    storyAction,
    storyExperience,
    storyObservation,
    promisingPractices,
    studentCharacteristics,
    successSigns,
    files: attachments = [], // Default to an empty array if files are not present
  } = data;

  const [fetchStoryParams, setFetchStoryParams] = useState<{
    enabled: boolean;
    id: string;
    storyType: StoryReactionPayload["type"] | "none";
  }>({ enabled: false, id: "", storyType: "none" });
  const { story: currentStory, refetch } = useGetStoryData(fetchStoryParams);

  const { handler: reactToStory, mutationSuccess } = _useMutateCollections({
    mutation: "addReactionToStory",
    successCallback: () => null,
    errorMessage: "Failed to react to story",
    successMessage: "You successfully reacted to this story",
  });
  const { avatarTextColor } = COLORS.story;
  const { defaultText } = COLORS.getStarted;

  /**
   *
   * @DERIVED
   *
   */
  const storyTags = [
    ...successSigns.map((tag) => ({ ...tag, type: "success sign" })),
    ...studentCharacteristics.map((tag) => ({
      ...tag,
      type: "characteristic",
    })),
    ...promisingPractices.map((tag) => ({
      ...tag,
      type: "promising practice",
    })),
  ];
  const storyDate = getDateFormatForStory(new Date(data?.createdAt as any));
  const author = data?.author?.name ?? "Anonymous";

  const storyActionText =
    storyAction.trim() !== ""
      ? `${storyAction.trim()}${
          endsWithChar(storyAction.trim(), ".") ? " " : ". "
        }`
      : "";

  const storyObservationText =
    storyObservation.trim() !== ""
      ? `${storyObservation.trim()}${
          endsWithChar(storyObservation.trim(), ".") ? " " : ". "
        }`
      : "";

  const storyExperienceText =
    storyExperience.trim() !== ""
      ? `${storyExperience.trim()}${
          endsWithChar(storyExperience.trim(), ".") ? " " : ". "
        }`
      : "";

  const body = storyActionText + storyObservationText + storyExperienceText;

  /**
   *
   * @Handlers
   *
   */
  const onClickLike = async (e: any) => {
    e.stopPropagation();
    const props: StoryReactionPayload = {
      story: (data as any)?._id,
      type: "Like",
      user: (user as any)?.sub,
    };
    setFetchStoryParams({
      enabled: true,
      id: (data as any)._id,
      storyType: "Like",
    });

    reactToStory(props as any);
  };

  const onClickInsightful = (e: any) => {
    e.stopPropagation();
    const props: StoryReactionPayload = {
      story: (data as any)?._id,
      type: "Insighful",
      user: (user as any)?.sub,
    };
    setFetchStoryParams({
      enabled: true,
      id: (data as any)._id,
      storyType: "Insighful",
    });
    reactToStory(props as any);
  };

  const onClickKudos = (e: any) => {
    e.stopPropagation();
    const props: StoryReactionPayload = {
      story: (data as any)?._id,
      type: "High5",
      user: (user as any)?.sub,
    };
    setFetchStoryParams({
      enabled: true,
      id: (data as any)._id,
      storyType: "High5",
    });
    reactToStory(props as any);
  };

  /***@RenderFns */
  const renderAvatar = () => {
    if (author === "Anonymous")
      return <FaUserSecret color="#fff" size="20px" />;
    let initials = "";
    author.split(" ").forEach((name) => {
      initials += name.charAt(0);
    });
    initials = initials.substring(0, 2);
    return (
      <span className="text-xs lg:text-sm font-interBold text-white">
        {initials}
      </span>
    );
  };

  const renderStoryTags = () => {
    return storyTags.map((tag, idx) => {
      const backgroundColor = assignColorToStoryTags(tag.type as any);
      return (
        <div
          style={{
            border: `2px solid ${backgroundColor}`,
          }}
          key={idx}
          className="bg-gray-100 p-1 px-3 rounded-full mb-2 mr-2 lg:mr-0 text-defaultText text-[10px] font-interBold"
        >
          {tag.name}
        </div>
      );
    });
  };

  const regex = /(@\[[^\]]+](?:\([^)]+\))?(?:\[\w+\])?)/g;
  const parts = body.split(regex);

  const renderStoryDescription = (parts: string[]) => {
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const match = part.match(/\[([^\]]+)\]/);
        const username = match ? match[1] : "";
        return (
          <span className="font-interBold" key={index}>
            {username}
          </span>
        );
      } else {
        return part;
      }
    });
  };

  useEffect(() => {
    if (mutationSuccess) {
      refetch();
    }
  }, [mutationSuccess, fetchStoryParams]);

  //
  return (
    <div
      onClick={() => props?.onClick?.()}
      className={`z-10 box-border overflow-hidden flex w-full p-1 md:p-2 rounded-md cursor-pointer hover:bg-[#e5f2f250] ${
        data.type === "LL" ? "bg-gray-100" : "bg-white"
      } `}
    >
      <div className="flex flex-col w-full pl-3 pr-2 lg:pr-5">
        <div className="flex flex-col lg:flex-row w-full">
          {/* Avatar, author (user), date */}
          <div className="flex flex-col lg:w-3/5 mr-6">
            <div className="flex gap-x-2">
              <div
                style={{ backgroundColor: "#304A78" }}
                className="flex w-fit shrink-0 w-8 h-8 mt-1 lg:w-10 lg:h-10 rounded-full justify-center items-center"
              >
                {renderAvatar()}
              </div>
              <div className="flex flex-col gap-y-[2px] py-1 pb-3 lg:py-3">
                <h3
                  style={{ color: avatarTextColor }}
                  className="text-sm font-interBold "
                >
                  {author}
                </h3>
                <span className="text-xs font-interLite text-defaultText">
                  {storyDate}
                </span>
              </div>
            </div>

            {/* Body content */}
            <p
              className="text-xs text-black text-justify 
                          font-inter max-h-[400px] 
                          whitespace-pre-wrap break-words 
                          overflow-scroll leading-5 py-3"
            >
              {renderStoryDescription(parts)}
            </p>
            {/* Story tags */}
            <div className="flex w-full flex-wrap space-x-0 lg:space-x-4 justify-start items-center pt-1">
              {renderStoryTags()}
            </div>
          </div>

          {/* Story Attachment(s) */}
          <div className="flex lg:w-2/5 lg:h-[400px] items-center overflow-scroll pt-3 z-10">
            {attachments.map((attachment, index) => (
              <StoryAttachmentViewer
                key={index}
                attachmentUrl={attachment.url}
              />
            ))}
          </div>
        </div>

        {/* Edit button, Attachment, and Reactions */}
        <div className="flex flex-col mt-0 lg:mt-3 md:flex-row md:items-end justify-between border-top-[1px] border-gray-200">
          {RenderIf(
            storyIsEditable,
            <button
              onClick={onClickEditStory}
              className="flex items-center self-start lg:self-center mt-5 md:mt-0 md:mb-0 border-[1.5px] border-[#57BDA2] space-x-[5px] pb-2 py-2 px-5 w-fit rounded-lg hover:cursor-pointer"
            >
              <AiTwotoneEdit color="#000" className="h-[15px] lg:h-5" />
              <span className="text-xs text-black font-inter">Edit</span>
            </button>
          )}

          {/* Reactions */}
          <div className="flex ml-0 lg:ml-auto w-full md:w-fit border-t-[1px] md:border-none my-2 pt-2 border-gray-100 justify-between items-baseline gap-x-10 z-30">
            <div className="flex h-fit p-0 box-border items-end w-fit hover:bg-gray-100 ">
              <GrFormAttachment
                color={defaultText}
                size="25px"
                className="-bottom-1 relative"
              />
              <span className="flex items-center text-sm text-defaultText font-interMedium">
                {`${data.files?.length}`}
                <span className="text-xs hidden lg:flex ml-1 ">Files</span>
              </span>
            </div>

            <div
              onClick={onClickLike}
              className="flex gap-x-2 items-end"
              data-testid="likes-count"
            >
              <BaseIcon
                className="cursor-pointer"
                ActiveIcon={() => (
                  <AiFillLike size="20px" className="lg:scale-[1.2]" />
                )}
                InactiveIcon={() => (
                  <AiOutlineLike size="20px" className="lg:scale-[1.2]" />
                )}
              />
              <span className="text-sm text-defaultText font-interMedium">
                {currentStory?.likes ?? data?.likes ?? 0}
              </span>
            </div>

            <div
              onClick={onClickKudos}
              className="flex gap-x-2 items-end"
              data-testid="high5s-count"
            >
              <BaseIcon
                className="cursor-pointer"
                ActiveIcon={() => (
                  <img
                    src={ProIcons.ActiveKudosIcon}
                    alt=""
                    className="h-5 lg:h-7"
                  />
                )}
                InactiveIcon={() => (
                  <img
                    src={ProIcons.InactiveKudosIcon}
                    alt=""
                    className="h-5 lg:h-7"
                  />
                )}
              />
              <span className="text-sm text-defaultText font-interMedium">
                {currentStory?.high5s ?? data?.high5s ?? 0}
                {/* {numberOfKudosReactions} */}
              </span>
            </div>

            <div
              onClick={onClickInsightful}
              className="flex gap-x-2 items-end"
              data-testid="insightfuls-count"
            >
              <BaseIcon
                className="cursor-pointer"
                ActiveIcon={() => (
                  <HiLightBulb size="25px" className="lg:scale-[1.2]" />
                )}
                InactiveIcon={() => (
                  <HiOutlineLightBulb size="25px" className="lg:scale-[1.2]" />
                )}
              />
              <span className="text-sm text-defaultText font-interMedium">
                {currentStory?.Insighfuls ?? data?.Insighfuls ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
