const storyTypeOption = ["Success", "Lesson Learned"];

export const useFilterModalStoryTypeOptions = (): LabelValue[] => {
  return storyTypeOption.map((type) => ({
    label: type,
    value: type,
  }));
};
