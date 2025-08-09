import { PropsWithChildren } from "react";
import { BaseModalAdaptor } from "../../../core/hoc";
import Modal from "react-modal";

interface DashboardFilterModalWrapperProps extends PropsWithChildren {
  isOpen?: boolean;
  toggleModal?: Function;
}

export const DashboardFilterModalWrapper: React.FC<
  DashboardFilterModalWrapperProps
> = ({ children, isOpen, toggleModal }) => {
  const pageWidth = document.getElementsByTagName("body")[0].clientWidth;
  const customStyles: Modal.Styles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: pageWidth < 700 ? "90%" : "38%",
      backgroundColor: "white",
      maxHeight: "500px",
      overflowY: "auto",
      borderRadius: "10px",
      zIndex: 100,
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
