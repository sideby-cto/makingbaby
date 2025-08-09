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
import { AxiosError } from "axios";
import { Mutations } from "../../api";

interface FormValues {
  title: string;
}

export const CreateOrEditSuccessSignModal: React.FC<ModalProps> = ({
  onCloseModalClick,
  type,
  populatedData,
  refetch,
}) => {
  const inputElementId = useId();
  const modalHeader =
    type === "create"
      ? "Add a new student success sign"
      : "Populated Student Success Sign";

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
    mutateAsync: createSuccessSignMutateAsync,
    isPending: isCreateSuccessSignLoading,
  } = useMutation({
    mutationFn: Mutations.createSuccessSign,
    ...mutateOptions,
  });

  // mutate for edit an existing batch
  const {
    mutateAsync: editSuccessSignMutateAsync,
    isPending: isEditSuccessSignLoading,
  } = useMutation({
    mutationFn: Mutations.updateSuccessSign,
    ...mutateOptions,
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      title: type === "create" ? "" : populatedData?.name,
    },
    onSubmit: ({ title }) => {
      if (populatedData && type === "update") {
        // update
        editSuccessSignMutateAsync({
          name: title,
          _id: populatedData._id, // temporal
          createdAt: new Date(), // temporal
        });
        return;
      }
      // create
      createSuccessSignMutateAsync({
        name: title,
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
            <h4 className="text-xs  uppercase">Success Sign</h4>
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
          {/* <div className="flex gap-3">
            <input
              type="checkbox"
              name="isDistrictLevel"
              onChange={handleChange}
              checked={isDistrictLevel}
            />
            <label className="text-[#7A4069] text-xs font-bold" htmlFor="isDistrictLevel">
              Set as a district level
            </label>
          </div>
          <Select
            options={$SCHOOLS.map((school) => ({
              label: school.name,
              value: school._id,
            }))}
            label="School"
            onChange={handleChange}
            value={schoolName}
            name="schoolName"
            placeholder="Select a school"
            errorMessage={schoolNameError}
          /> */}
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
              ? isEditSuccessSignLoading
              : isCreateSuccessSignLoading
          }
        />
      </div>
    </div>
  );
};
