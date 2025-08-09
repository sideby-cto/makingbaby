
import React from 'react';

export const CardFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`flex flex-row items-center p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};
