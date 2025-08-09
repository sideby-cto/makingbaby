export const transformStoryMetaIntoTags = (
  successSigns: any[],
  studentCharacteristics: any[],
  promisingPractices: any[]
) => {
  return [
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
};
