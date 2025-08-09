export const RenderIf = (condition: boolean, Component: JSX.Element) => {
  if (condition) return Component;
  return null;
};
