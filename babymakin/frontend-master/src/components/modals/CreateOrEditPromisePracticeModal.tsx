import React, { useId } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import { useMutation } from "@tanstack/react-query";

import { useFormik } from "formik";
import * as Yup from "yup";
import { FocusError } from "focus-formik-error";
import { FormSubmitButton } from "../buttons";
import { TextInput } from "../inputs";
import { ModalProps } from "../../utils/types";
import { Mutations } from "../../api";
import { AxiosError } from "axios";

interface FormValues {
  title: string;
}

export const CreateOrEditPromisePracticeModal: React.FC<ModalProps> = ({
  onCloseModalClick,
  type,
  populatedData,
  refetch,
}) => {
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
  const {
    mutateAsync: createPromisingPracticeMutateAsync,
    isPending: isCreatePromisingPracticeLoading,
  } = useMutation({
    mutationFn: Mutations.createPromisingPractice,
    ...mutateOptions,
  });

  // mutate for edit an existing batch
  const {
    mutateAsync: editPromisingPracticeMutateAsync,
    isPending: isEditPromisingPracticeLoading,
  } = useMutation({
    mutationFn: Mutations.updatePromisingPractice,
    ...mutateOptions,
  });

  const modalHeader =
    type === "create" ? "Add a new practice" : "Populated Promising Practice";
  const formik = useFormik<FormValues>({
    initialValues: {
      title: type === "create" ? "" : populatedData?.name,
    },
    onSubmit: (values) => {
      if (populatedData && type === "update") {
        // update
        editPromisingPracticeMutateAsync({
          name: title,
          _id: populatedData._id,
          createdAt: new Date(), // temporal
        });
        return;
      }
      // create
      createPromisingPracticeMutateAsync({
        name: values.title,
      });
    },
    validationSchema: Yup.object({}).shape({
      title: Yup.string().required("Title is required"),
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
            <h4 className="text-xs  uppercase">Promise Practice</h4>
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
          title="Save Changes"
          loading={
            type === "update"
              ? isEditPromisingPracticeLoading
              : isCreatePromisingPracticeLoading
          }
        />
      </div>
    </div>
  );
};
