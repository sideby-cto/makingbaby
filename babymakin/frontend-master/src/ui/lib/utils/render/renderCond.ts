export const RenderCondition = (
  condition: boolean,
  trueNode: React.ReactNode,
  falseNode: React.ReactNode
) => {
  if (condition) return trueNode;
  return falseNode;
};
