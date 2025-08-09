import { SmallWinsStoryType } from "../../utils/types";

const validateStoryTags = (
  signs: any[],
  practices: any[],
  characteristics: string[],
  type: SmallWinsStoryType
) => {
  if (!signs || !practices || !characteristics || !type) return false;
  const hasPractices = practices.length > 0;
  if (!hasPractices) throw Error("Select at least 1 Practice");

  const hasSigns = signs.length > 0;
  if (!hasSigns) throw Error("Select at least 1 Sign");

  const hasCharacteristics = characteristics.length > 0;
  if (!hasCharacteristics) throw Error("Select at least 1 Characteristic");

  return hasSigns && hasPractices && hasCharacteristics;
};

const validatedStoryText = (action: string | undefined) => {
  const hasAction = Boolean(action);
  return hasAction;
};

export const validateStory = (
  team: string,
  author: string | null,
  signs: any[],
  practices: any[],
  characteristics: any[],
  storytype: SmallWinsStoryType,
  action: string | undefined,
  observation: string | undefined,
  experience: string | undefined
) => {
  const hasSelectedTeam = Boolean(team);
  if (!hasSelectedTeam) throw Error("Select a school");

  const hasValidatedText = validatedStoryText(action);
  if (!hasValidatedText) throw Error("Tell the Story box is blank");

  const hasValidatedTags = validateStoryTags(
    signs,
    practices,
    characteristics,
    storytype
  );

  const hasAuthor = Boolean(author);
  if (!hasAuthor) throw Error("Story has no author");

  return hasSelectedTeam && hasAuthor && hasValidatedTags && hasValidatedText;
};
