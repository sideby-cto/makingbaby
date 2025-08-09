import Modal from 'react-modal';
import { ComponentType } from 'react';

const ModalSafeForReact18 = Modal as unknown as ComponentType<ReactModal['props']>;

// import ReactModal from 'react-modal';

/* This just wraps react-modal to allow styling the modal overlay,
 you shouldn't have the need to change this at all */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ReactModalAdaptor = ({
  ...props
}: React.ComponentProps<any>): JSX.Element => {
  Modal.setAppElement('#root'); // suppresses modal-related test warnings.
  const pageWidth = document.getElementsByTagName('body')[0].clientWidth;
  const customStyles: Modal.Styles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: pageWidth < 700 ? '90%' : '38%',
      backgroundColor: 'white',
      maxHeight: '500px',
      overflowY: 'auto',
      borderRadius: '10px',
      zIndex: 100,
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#0000001A',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
    },
  };

  return <ModalSafeForReact18 style={customStyles} {...props} />;
};
