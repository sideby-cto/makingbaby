import { AiOutlineDelete } from "react-icons/ai";
import { FormSubmitButton } from "../buttons";

interface ConfirmDeleteSuccessModalProps {
  onCloseClick: () => void;
  itemTitle?: string;
}

export const ConfirmDeleteSuccessModal: React.FC<
  ConfirmDeleteSuccessModalProps
> = ({ onCloseClick, itemTitle }) => (
  <div className="px-14 pt-14 pb-8">
    <div className="flex justify-center items-center flex-col gap-2 mb-6">
      <AiOutlineDelete
        className="text-[#FF0063] transition-all duration-200 hover:scale-110 transform"
        size="40px"
      />
      <h4 className="text-base font-semibold">{itemTitle}</h4>
      <p className="text-xs text-[#FF0063]">deleted successfully?</p>
    </div>
    <FormSubmitButton
      onClick={onCloseClick}
      backgroundColor="#000000b4"
      title="Close"
    />
  </div>
);
