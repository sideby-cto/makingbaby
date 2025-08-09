import { MentionData } from "src/components/containers/StoryTextBox";
import { SmallWinsStoryType } from "../../utils/types";

export const createStoryForm = (
  schoolid: string,
  postedBy: string | null,
  successSigns: string[],
  promisingPractices: string[],
  studentCharacteristics: string[],
  storyType: SmallWinsStoryType,
  storyAction: string,
  storyObservation: string,
  storyExperience: string,
  user: any,
  taggedUsers: MentionData[],
  files: FileList | []
) => {
  const storyForm = new FormData();
  storyForm.set("userId", (user as any).id);
  storyForm.set("storyAction", storyAction ?? "");
  storyForm.set("storyObservation", storyObservation ?? "");
  storyForm.set("storyExperience", storyExperience ?? "");

  if (Array.isArray(successSigns)) {
    for (let sign of successSigns) {
      storyForm.append("successSigns", sign);
    }
  }

  if (Array.isArray(promisingPractices)) {
    for (let practice of promisingPractices) {
      storyForm.append("promisingPractices", practice);
    }
  }

  if (Array.isArray(studentCharacteristics)) {
    for (let characteristics of studentCharacteristics) {
      storyForm.append("studentCharacteristics", characteristics);
    }
  }

  // Set user (author)
  if (postedBy !== "anonymous") {
    storyForm.set("author", postedBy as string);
  }

  if (storyType === "Success") {
    storyForm.set("type", "SW");
  } else if (storyType === "Lesson Learned") {
    storyForm.set("type", "LL");
  }

  // Handle multiple files
  if (files.length > 0) {
    for (const file of Array.from(files!)) {
      storyForm.append("files", file);
    }
  }

  if (schoolid) storyForm.set("school", schoolid);

  // Handle tagged users
  if (Array.isArray(taggedUsers)) {
    let uniqueIds = new Set();

    for (let user of taggedUsers) {
      uniqueIds.add(user.id);
    }

    uniqueIds.forEach((id: any) => {
      storyForm.append("taggedUsersId", id);
    })
  }

  return storyForm;
};

/* Edit / Update Story */
export const createUpdateStoryParams = (
  schoolid: string,
  postedBy: string | null,
  successSigns: string[],
  promisingPractices: string[],
  studentCharacteristics: string[],
  storyType: SmallWinsStoryType,
  storyAction: string,
  storyObservation: string,
  storyExperience: string,
  user: any,
  taggedUsers: MentionData[],
  files: FileList | []
) => {
  const updateForm = new FormData();
  updateForm.set("userId", (user as any).id);
  updateForm.set("storyAction", storyAction ?? "");
  updateForm.set("storyObservation", storyObservation ?? "");
  updateForm.set("storyExperience", storyExperience ?? "");
  
  // Set user (author)
  if (postedBy !== "anonymous") {
    updateForm.set("author", postedBy as string);
  }

  // Success Signs, Promising Practices, Student Characteristics
  successSigns.forEach(sign => updateForm.append("successSigns", sign));
  promisingPractices.forEach(practice => updateForm.append("promisingPractices", practice));
  studentCharacteristics.forEach(characteristic => updateForm.append("studentCharacteristics", characteristic));

  // Set story type (Success / Lesson Learned)
  if (storyType === "Success") {
    updateForm.set("type", "SW");
  } else {
    updateForm.set("type", "LL");
  }

  // Set school ID
  if (schoolid) {
    updateForm.set("school", schoolid);
  }

  // Handle multiple files
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      updateForm.append("files", file);
    });
  }
  
  // Handle taggedUsers
  if (Array.isArray(taggedUsers)) {
    let uniqueIds = new Set();

    for (let user of taggedUsers) {
      uniqueIds.add(user.id);
    }

    uniqueIds.forEach((id: any) => {
      updateForm.append("taggedUsersId", id);
    })
  }


  return updateForm;
};
