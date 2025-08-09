export const storyIsEditable = (user: any, story: any) => {
  return (user as any)?.id === ((story?.author as any)?._id || story?.userId);
};
