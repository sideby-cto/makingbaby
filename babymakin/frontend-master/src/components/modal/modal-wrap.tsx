import { FC, PropsWithChildren } from "react";
import { ReactModalAdaptor } from "src/utils";

interface ModalWrapProps extends PropsWithChildren {
  modalIsOpen: boolean;
  toggleModal: () => void;
}

export const ModalWrap: FC<ModalWrapProps> = ({
  modalIsOpen,
  toggleModal,
  children,
}) => (
  <ReactModalAdaptor
    closeTimeoutMS={200}
    isOpen={modalIsOpen}
    onRequestClose={toggleModal}
    shouldCloseOnOverlayClick={false}
  >
    {children}
  </ReactModalAdaptor>
);
