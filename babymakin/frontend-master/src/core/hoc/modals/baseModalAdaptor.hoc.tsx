import React from "react";
import Modal from "react-modal";

const TypedModal = Modal as any;

// import ReactModal from 'react-modal';

/* This just wraps react-modal to allow styling the modal overlay,
 you shouldn't have the need to change this at all */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BaseModalAdaptor: React.FC<any> = ({
  ...props
}: React.ComponentProps<any>): JSX.Element => {
  Modal.setAppElement("#root"); // suppresses modal-related test warnings.

  return <TypedModal {...props} />;
};
