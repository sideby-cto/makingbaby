import React, { useId } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { FocusError } from "focus-formik-error";
import { FormSubmitButton } from "../buttons";
import { TextInput, Select } from "../inputs";
import {
  GoalType,
  ModalProps,
  PromisingPracticeType,
  SchoolType,
  StudentCharacteristicType,
  SuccessSignType,
  TeamGoalType,
} from "../../utils/types";
import { AxiosError } from "axios";
import { Mutations } from "../../api";
import { useCollections } from "../../utils";

interface FormValues {
  title: string;
  school: string;
}

export const CreateOrEditTeamModal: React.FC<
  ModalProps & {
    isLoading: boolean;
    checkBoxData: {
      goals: GoalType[];
      promisingPractices: PromisingPracticeType[];
      successSigns: SuccessSignType[];
      studentCharacteristics: StudentCharacteristicType[];
    };
  }
> = ({ onCloseModalClick, type, populatedData, refetch }) => {
  const inputElementId = useId();
  // const [teamGoals, setTeamGoals] = useState<TeamGoalType[]>(
  //   type === "update" && populatedData.teamGoals ? populatedData.teamGoals : []
  // );
  const { collections } = useCollections();
  const { allSchools } = collections;

  const modalHeader =
    type === "create" ? "Add a new team" : populatedData?.name;

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
  const { mutateAsync: createTeamMutateAsync, isPending: isCreateTeamLoading } =
    useMutation({ mutationFn: Mutations.createTeam, ...mutateOptions });

  // mutate for edit an existing batch
  const { mutateAsync: editTeamMutateAsync, isPending: isEditTeamLoading } =
    useMutation({ mutationFn: Mutations.updateTeam, ...mutateOptions });

  const formik = useFormik<FormValues>({
    initialValues: {
      title: type === "update" && populatedData.name ? populatedData.name : "",
      school:
        type === "update" && populatedData.school ? populatedData.school._id : "",
    },
    onSubmit: (values) => {
      const schoolObject = allSchools.filter(
        (school: SchoolType) => school._id === values.school
      )[0];
      const tempTeamGoals = schoolObject.schoolGoals ?? [];
      const teamGoals = tempTeamGoals.map((item: TeamGoalType) => ({
        goal: item.goal._id,
        promisingPractices: item.promisingPractices.map((val) => val._id),
        studentCharacteristics: item.studentCharacteristics.map(
          (val) => val._id
        ),
        successSigns: item.successSigns.map((val) => val._id),
      }));

      // const _teamGoals = teamGoals.map((item) => ({
      //   goal: item.goal._id,
      //   promisingPractices: item.promisingPractices.map((val) => val._id),
      //   studentCharacteristics: item.studentCharacteristics.map(
      //     (val) => val._id
      //   ),
      //   successSigns: item.successSigns.map((val) => val._id),
      // }));
      if (populatedData && type === "update") {
        // update
        editTeamMutateAsync({
          name: values.title,
          teamGoals,
          school: values.school,
          _id: populatedData._id,
        });
        return;
      }
      // create
      createTeamMutateAsync({
        name: values.title,
        teamGoals,
        school: values.school,
      });
    },
    validationSchema: Yup.object({}).shape({
      title: Yup.string().required("Title is required"),
      school: Yup.string().required("School is required"),
    }),
  });

  const {
    handleChange,
    handleSubmit,
    values: { title, school },
    errors: { title: titleError, school: schoolError },
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
            <h4 className="text-xs  uppercase">Team</h4>
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
        <div>
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
            <Select
              options={allSchools.map((school: SchoolType) => ({
                label: school.name,
                value: school._id,
              }))}
              label="School"
              onChange={handleChange}
              value={school}
              name="school"
              placeholder="Select a school"
              errorMessage={schoolError}
            />
          </div>
        </div>

        <div className="">
          {!isValid && isSubmitting && (
            <span className="text-red-500 text-xs">
              Please complete the form before saving
            </span>
          )}
          <hr className="mb-5 mt-8" />
          <FormSubmitButton
            onClick={handleSubmit}
            title="Save Changes"
            loading={
              type === "update" ? isEditTeamLoading : isCreateTeamLoading
            }
          />
        </div>
      </form>
    </div>
  );
};
