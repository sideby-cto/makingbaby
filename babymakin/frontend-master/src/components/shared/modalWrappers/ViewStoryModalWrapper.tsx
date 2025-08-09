import { PropsWithChildren } from "react";
import { BaseModalAdaptor } from "../../../core/hoc";
import Modal from "react-modal";

interface ViewStoryModalWrapperProps extends PropsWithChildren {
  children?: React.ReactNode;
  isOpen?: boolean;
  toggleModal?: Function;
}

export const ViewStoryModalWrapper: React.FC<ViewStoryModalWrapperProps> = ({
  isOpen,
  toggleModal,
  children,
}) => {
  const pageWidth = document.getElementsByTagName("body")[0].clientWidth;
  const customStyles: Modal.Styles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: pageWidth < 700 ? "90%" : "80%",
      backgroundColor: "white",
      height: "75vh",
      overflowY: "auto",
      borderRadius: "10px",
      zIndex: 100,
      padding: "0px",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#0000001A",
      backdropFilter: "blur(4px)",
      zIndex: 50,
    },
  };
  return (
    <BaseModalAdaptor
      closeTimeoutMS={200}
      isOpen={isOpen}
      onRequestClose={toggleModal}
      shouldCloseOnOverlayClick={false}
      style={customStyles}
    >
      {children}
    </BaseModalAdaptor>
  );
};
