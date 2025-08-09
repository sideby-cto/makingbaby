/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { FaUserSecret } from "react-icons/fa";
import {
  endsWithChar,
  useGetStoryData,
  _useMutateCollections,
} from "../../utils";
import { StoryAttachmentViewer } from "../containers/story_attachment_viewer/StoryAttachmentViewer";
import { StoryReactionPayload, StoryType } from "../../utils/types";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { DownloadAttachment } from "../../core/helper-functions";
import {
  AiFillLike,
  AiOutlineCloseCircle,
  AiFillFile,
  AiOutlineLike,
} from "react-icons/ai";
import { assignColorToStoryTags } from "../../story";
import { COLORS } from "src/design-system";
import { ProIcons } from "../../assets/icons";
import { HiLightBulb, HiOutlineLightBulb } from "react-icons/hi";
import { BaseIcon } from "../shared";
import { useUserGlobalState } from "../../hooks/useUserGlobalState";

interface Props {
  story: StoryType;
  onClose?: Function;
}

export const ViewStoryDetailsModal: React.FC<Props> = ({ story, onClose }) => {
  const user = useUserGlobalState()[0];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetchStoryParams, setFetchStoryParams] = useState<{
    enabled: boolean;
    id: string;
    storyType: StoryReactionPayload["type"] | "none";
  }>({ enabled: false, id: "", storyType: "none" });
  const [isHovering, setIsHovering] = useState(false);
  const { story: currentStory, refetch } = useGetStoryData(fetchStoryParams);

  const { handler: reactToStory, mutationSuccess } = _useMutateCollections({
    mutation: "addReactionToStory",
    successCallback: () => null,
    errorMessage: "Failed to react to story",
    successMessage: "successful reacted to story",
  });
  /**
   * VARIABLES
   */
  const attachments = story?.files ?? [];
  const attachmentAvailable = useMemo(() => {
    return attachments.length! >= 1;
  }, [attachments]);
  const { backgroundColor: navbarBackground } = COLORS.navbar;

  const author = story?.author?.name ?? "Anonymous";
  const {
    storyAction,
    storyObservation,
    storyExperience,
    promisingPractices,
    studentCharacteristics,
    successSigns,
  } = story;
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
  const body = `${storyAction.trim()}${
    endsWithChar(storyAction.trim(), ".")
      ? " " + storyObservation.trim()
      : ". " + storyObservation.trim()
  }${
    endsWithChar(storyObservation.trim(), ".")
      ? " " + storyExperience.trim()
      : ". " + storyExperience.trim()
  }`;

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

  /**
   *
   * HANDLERS
   */
  const onClickLike = async (e: any) => {
    e.stopPropagation();
    const props: StoryReactionPayload = {
      story: (story as any)?._id,
      type: "Like",
      user: (user as any)?.sub,
    };
    setFetchStoryParams({
      enabled: true,
      id: (story as any)._id,
      storyType: "Like",
    });

    reactToStory(props as any);
  };

  const onClickInsightful = (e: any) => {
    e.stopPropagation();
    const props: StoryReactionPayload = {
      story: (story as any)?._id,
      type: "Insighful",
      user: (user as any)?.sub,
    };
    setFetchStoryParams({
      enabled: true,
      id: (story as any)._id,
      storyType: "Insighful",
    });
    reactToStory(props as any);
  };

  const onClickKudos = (e: any) => {
    e.stopPropagation();
    const props: StoryReactionPayload = {
      story: (story as any)?._id,
      type: "High5",
      user: (user as any)?.sub,
    };
    setFetchStoryParams({
      enabled: true,
      id: (story as any)._id,
      storyType: "High5",
    });
    reactToStory(props as any);
  };

  const renderAvatar = () => {
    if (author === "Anonymous")
      return <FaUserSecret color="#fff" size="20px" />;
    let initials = "";
    author?.split(" ").forEach((name) => {
      initials += name.charAt(0);
    });
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
            backgroundColor: `${navbarBackground}80`,
            border: `2px solid ${backgroundColor}`,
          }}
          key={idx}
          className="p-1 px-3 rounded-full mb-2 mr-2 lg:mr-0 bg-[#293462]/10 text-[#293462] text-[10px] font-interBold"
        >
          {tag.name}
        </div>
      );
    });
  };

  // cursor-tracking functions, set true if cursor is above attachment
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const viewNextAttachment = () => {
    if (currentIndex === attachments.length! - 1) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex(currentIndex + 1);
  };

  const viewPreviousAttachment = () => {
    if (currentIndex === 0) {
      setCurrentIndex(attachments.length! - 1);
      return;
    }
    setCurrentIndex(currentIndex - 1);
  };

  useEffect(() => {
    if (mutationSuccess) {
      refetch();
    }
  }, [mutationSuccess, fetchStoryParams]);

  return (
    <div
      className="relative w-full h-full flex flex-col lg:flex-row gap-x-5 lg:gap-x-0 gap-y-0 lg:gap-y-5 overflow-y-auto lg:overflow-hidden"
      data-testid="modal-container"
    >
      <section className="relative flex w-full lg:w-[50%] md:py-5 pb-96 justify-center bg-[#00000010] overflow-scroll">
        {attachmentAvailable ? (
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {attachments.map((attachment, index) => (
              <StoryAttachmentViewer
                key={index}
                attachmentUrl={attachment.url}
                isModal
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-y-3 mx-auto items-center my-auto">
            <AiFillFile color="black" size="48px" />
            <p className="font-interMedium text-md text-black">
              No Attachment Available
            </p>
          </div>
        )}

        {(attachments.length ?? 0) > 1 && (
          <div className="absolute h-full w-full bg-[#00000020]  flex justify-between items-center p-[1%] px-2 lg:p-[3%]">
            <BsChevronLeft
              onClick={() => viewPreviousAttachment()}
              color="#fff"
              size="40px"
            />
            <BsChevronRight
              onClick={() => viewNextAttachment()}
              color="#fff"
              size="40px"
            />
          </div>
        )}
      </section>
      {/* Post content */}
      <section className="relative flex flex-col w-full lg:w-[50%] min-h-fit lg:h-full lg:overflow-y-hidden pb-16 pt-10 lg:pb-0">
        <div className="overflow-y-auto pb-20 px-[4%] h-full">
          <div className="flex gap-x-5 items-center">
            <div className="flex w-fit w-8 lg:w-10 h-8 lg:h-10 rounded-full justify-center items-center bg-[#15133C]">
              {renderAvatar()}
            </div>
            <span className="text-md font-interBold">{author}</span>
          </div>

          <p className="text-sm lg:text-md font-inter text-black text-left pt-5 pb-2 leading-6">
            {renderStoryDescription(parts)}
          </p>
          <div className="flex w-full flex-wrap space-x-0 lg:gap-x-4 justify-start items-center pt-5">
            {renderStoryTags()}
          </div>
        </div>

        {/* Response signs */}
        <div className="flex w-full md:w-fit border-t-[1px] px-[4%] md:border-none pt-3 border-gray-700 justify-between items-end gap-x-10 z-30">
          <div
            onClick={onClickLike}
            className="flex gap-x-2 pb-5 items-end"
            data-testid="modal-likes"
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
              {currentStory?.likes ?? story?.likes ?? 0}
            </span>
          </div>

          <div
            onClick={onClickKudos}
            className="flex gap-x-2 pb-5 items-end"
            data-testid="modal-high5s"
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
              {currentStory?.high5s ?? story?.high5s ?? 0}
              {/* {numberOfKudosReactions} */}
            </span>
          </div>

          <div
            onClick={onClickInsightful}
            className="flex gap-x-2 pb-5 items-end"
            data-testid="modal-insightfuls"
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
              {currentStory?.Insighfuls ?? story?.Insighfuls ?? 0}
            </span>
          </div>
        </div>
      </section>

      <div
        onClick={() => onClose?.()}
        className="fixed top-4 right-5 cursor-pointer"
      >
        <AiOutlineCloseCircle color="black" size="25px" />
      </div>
    </div>
  );
};
