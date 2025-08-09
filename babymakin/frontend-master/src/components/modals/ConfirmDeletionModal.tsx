import { DataForDeleteModalType } from "../../utils/types";
import { RoundedButton } from "../buttons";
import { Loading } from "../Loading";

interface ConfirmDeletionModalProps {
  onCancelClick: () => void;
  onConfirmClick: () => void;
  data?: DataForDeleteModalType;
  loading?: boolean;
}

export const ConfirmDeletionModal: React.FC<ConfirmDeletionModalProps> = ({
  onCancelClick,
  onConfirmClick,
  data,
  loading,
}) => {
  return (
    <div className="pt-10 px-4">
      {!loading ? (
        <>
          <div className="flex justify-center items-center flex-col gap-2">
            <h6 className="text-xs">Do you want to delete: </h6>
            <h4 className="text-base font-semibold">{data?.itemTitle}</h4>
            <p className="text-xs">from the list of {data?.listTitle}?</p>
          </div>
          <hr className="mt-8 mb-6" />
          <div className="flex justify-between">
            <RoundedButton
              backgroundColor="#444444"
              onClick={onCancelClick}
              title="Cancel"
            />
            <RoundedButton
              backgroundColor="#FF0063"
              onClick={onConfirmClick}
              title="Delete"
              loading={data?.loading}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex w-full h-32 justify-center items-center">
            <Loading color="#000" height="30px" />
          </div>
        </>
      )}
    </div>
  );
};
