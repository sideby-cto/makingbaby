import { TAG_COLORS } from "../ui";
import { StoryTagType } from "./types";

function assignColorToStoryTags(tag: StoryTagType) {
  switch (tag) {
    case "success sign":
      return TAG_COLORS.successSign;
    case "promising practice":
      return TAG_COLORS.promisingPractice;
    case "characteristic":
      return TAG_COLORS.characteristic;
    default:
      return "transparent";
  }
}

export { assignColorToStoryTags };
