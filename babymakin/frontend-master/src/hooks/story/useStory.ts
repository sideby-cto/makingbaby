import { StoryType } from "../../utils/types";
import { useNavigate } from "react-router-dom";
import { storyIsEditable as canEditStory } from "../../core";
import { useUserGlobalState } from "../useUserGlobalState";

interface UseStoryProps {
  data: StoryType;
  onClick?: Function;
}

export const useStory = ({ data }: UseStoryProps) => {
  const navigate = useNavigate();
  const user = useUserGlobalState()[0];
  const storyIsEditable = canEditStory(user, data);

  const onClickEditStory = () => {
    const editStoryPath = `/create-story?feature=edit&id=${(data as any)._id}`;
    navigate(editStoryPath);
  };

  return {
    storyIsEditable,
    onClickEditStory,
  };
};
