import React, { useId } from "react";
import { useMutation } from "@tanstack/react-query";
import { AiOutlineClose } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FocusError } from "focus-formik-error";
import { FormSubmitButton } from "../buttons";
import { TextInput } from "../inputs";
import { AxiosError } from "axios";
import { Mutations } from "../../api";
import { ModalProps } from "../../utils/types";

interface CreateOrEditGoalModalProps extends ModalProps {
  onCloseModalClick: () => void;
  type: "update" | "create";
  populatedData?: any;
}

interface FormValues {
  title: string;
  isDistrictLevel: boolean;
}

export const CreateOrEditGoalModal: React.FC<CreateOrEditGoalModalProps> = (
  props
) => {
  const { onCloseModalClick, type, refetch } = props;
  const modalHeader = type === "create" ? "Add a new goal" : "Populated Goal";
  const buttonTitle = type === "create" ? "Add Goal" : "Save Changes";
  const inputElementId = useId();

  const mutateOptions = {
    onError: (error: AxiosError) => {
      console.error(`${error.message}, Please try again!`, {
        className: "text-red-600",
      });
    },
    onSuccess: () => {
      onCloseModalClick();
      refetch();
    },
  };

  // mutate for creating a new batch
  const { mutateAsync: createGoalMutateAsync, isPending: isCreateGoalLoading } =
    useMutation({ mutationFn: Mutations.createGoal, ...mutateOptions });

  // mutate for edit an existing batch
  const { mutateAsync: editGoalMutateAsync, isPending: isEditGoalLoading } =
    useMutation({ mutationFn: Mutations.updateGoal, ...mutateOptions });

  const formik = useFormik<FormValues>({
    initialValues: {
      title: type === "create" ? "" : props?.populatedData?.name,
      isDistrictLevel:
        type === "create" ? false : props?.populatedData?.isDistrictLevel,
    },
    onSubmit: ({ isDistrictLevel, title }) => {
      if (props.populatedData && type === "update") {
        // update
        editGoalMutateAsync({
          isDistrictLevel: isDistrictLevel,
          name: title,
          _id: props.populatedData._id,
        });
        return;
      }
      // create
      createGoalMutateAsync({
        isDistrictLevel: isDistrictLevel,
        name: title,
      });
    },
    validationSchema: Yup.object({}).shape({
      title: Yup.string().required("Title is required"),
      isDistrictLevel: Yup.boolean(),
    }),
  });
  const {
    handleChange,
    handleSubmit,
    values: { title },
    errors: { title: titleError },
    isValid,
    isSubmitting,
    handleBlur,
  } = formik;

  return (
    <div className="flex flex-col gap-10 px-10">
      <div className="flex justify-between">
        <div className="flex items-start flex-col font-bold justify-start">
          <div className="flex items-center -ml-4 text-[#00808099] ">
            <BsDot className="" size="35px" />
            <h4 className="text-xs  uppercase">Goal</h4>
          </div>
          <h2 className="text-[#008080] -mt-2 text-lg">{modalHeader}</h2>
        </div>
        <AiOutlineClose
          className="-mr-10 hover:text-red-600 transition-all duration-200 cursor-pointer hover:scale-110 transform"
          size="20px"
          onClick={onCloseModalClick}
        />
      </div>
      <form>
        <FocusError formik={formik} />
        <div className="flex flex-col gap-6">
          <TextInput
            id={`${inputElementId}-title`}
            name="title"
            label="Title"
            onChange={handleChange}
            value={title}
            errorMessage={titleError}
            onBlur={handleBlur}
          />
        </div>
      </form>
      <div className="">
        {!isValid && isSubmitting && (
          <span className="text-red-500 text-xs">
            Please complete the form before saving
          </span>
        )}
        <hr className="mb-5" />
        <FormSubmitButton
          onClick={handleSubmit}
          title={buttonTitle}
          loading={type === "update" ? isEditGoalLoading : isCreateGoalLoading}
        />
      </div>
    </div>
  );
};
