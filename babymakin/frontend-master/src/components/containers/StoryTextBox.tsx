import React from "react";
import { SmallWinsStoryType } from "../../utils/types";
import { SmallWinsStoryTypes } from "../../utils/enums/enums";
import { GetUsersParam } from "../../hooks/user/useUserBank";
import { useGetUsers } from "src/utils";
import * as ReactMentions from "react-mentions";

const MentionsInput = ReactMentions.MentionsInput as any;
const Mention = ReactMentions.Mention as any;

interface StoryTexBoxProps {
  title: string;
  errorMessage?: string;
  actionHandler: (e?: any) => void;
  action: string | undefined;
  storyType: SmallWinsStoryType;
  schoolId: any;
  userId: any;
  onTaggedUsersChange: (taggedUsers: MentionData[]) => void;
}

export interface MentionData {
  id: any;
  display: any;
}

export const StoryTextBox: React.FC<StoryTexBoxProps> = ({
  errorMessage,
  actionHandler,
  action,
  storyType,
  schoolId,
  userId,
  onTaggedUsersChange,
}) => {
  const isSmallWins = storyType === SmallWinsStoryTypes.success;
  const textbox1Placeholder =
    `What I/ a colleague ${isSmallWins ? "did" : "tried"} was...  ` +
    `What happened next was...  My takeaway is...`;

  const getUsersParam: GetUsersParam = {
    currentPage: 0,
    enabled: true,
    pageSize: 10000,
    filter: "",
  };

  const { data: allUsers } = useGetUsers(getUsersParam);

  const allUserNames =
    allUsers && Array.isArray(allUsers)
      ? allUsers
          .filter(
            (user: any) =>
              user.schools.length > 0 &&
              user.schools.some((school: any) => school._id === schoolId)
          )
          .filter((user) => user.id !== userId)
          .map(({ id, name }) => ({ id, display: name }))
      : [];

  const handleInputChange = (e: any, value: any, plainTextValue: any, mentionsInInput: MentionData[]) => {
    const taggedUsers: MentionData[] = Array.isArray(mentionsInInput)
      ? mentionsInInput.map((mention: MentionData) => ({
          id: mention.id,
          display: mention.display,
        }))
      : [];
    onTaggedUsersChange(taggedUsers);
    actionHandler(e);
  };

  return (
    <>
      <div className="flex py-2 flex-col space-y-1 space-y-3 w-full lg:w-[95%]">
        <MentionsInput
          name="story"
          id=""
          value={action || ""}
          onChange={handleInputChange}
          rows={1}
          className="max-h-40 min-h-[100px] bg-gray-100 rounded-lg focus:outline-none text-sm text-black comments-textarea"
          placeholder={textbox1Placeholder}
        >
          <Mention
            data={allUserNames}
            trigger={"@"}
            style={{ backgroundColor: "#ccc" }}
            markup="@[__display__][__id__]"
          ></Mention>
        </MentionsInput>
      </div>
      <p className="text-xs text-defaultText font-inter">{errorMessage}</p>
    </>
  );
};
