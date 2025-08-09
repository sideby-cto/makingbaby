export const Box: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  return <div {...props}>{children}</div>;
};
