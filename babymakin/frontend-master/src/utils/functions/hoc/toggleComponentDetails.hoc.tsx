import React, { useState } from "react";
import { IHOCWrappedProps } from "../../types";

interface WrappedProps extends IHOCWrappedProps {}

export const toggleVisibilityHOC = (Wrapped: React.FC<WrappedProps>) => {
  return React.memo((props: any) => {
    const [visible, setVisible] = useState(false);

    const toggleVisible = () => setVisible((p) => !p);
    return (
      <Wrapped
        {...{ toggleVisibilityProps: { visible, toggleVisible }, ...props }}
      />
    );
  });
};
