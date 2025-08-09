import React, { useEffect, useId, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as Yup from "yup";
import { FocusError } from "focus-formik-error";
import { Mutations } from "../../api";
import { FormSubmitButton } from "../buttons";
import { CheckboxAndRelations, TextInput, Select } from "../inputs";
import {
  DistrictType,
  GoalType,
  ModalProps,
  PromisingPracticeType,
  StudentCharacteristicType,
  SuccessSignType,
  TeamGoalType,
  SchoolClassificationType,
} from "../../utils/types";

interface FormValues {
  title: string;
  district: string;
  schoolClassification: string;
}

export const CreateOrEditSchoolModal: React.FC<
  ModalProps & {
    isLoading: boolean;
    checkBoxData: {
      goals: GoalType[];
      promisingPractices: PromisingPracticeType[];
      successSigns: SuccessSignType[];
      studentCharacteristics: StudentCharacteristicType[];
    };
    districts: DistrictType[];
    schoolClassifications: SchoolClassificationType[];
  }
> = ({
  onCloseModalClick,
  type,
  populatedData,
  refetch,
  isLoading,
  checkBoxData: {
    goals: allGoals,
    promisingPractices,
    studentCharacteristics,
    successSigns,
  },
  districts,
  schoolClassifications,
}) => {
  const inputElementId = useId();
  const [goals, setGoals] = useState<Array<TeamGoalType>>(
    type === "update" && populatedData.schoolGoals
      ? populatedData.schoolGoals
      : []
  );
  const modalHeader =
    type === "create" ? "Add a new school" : populatedData?.name;

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
    mutateAsync: createSchoolMutateAsync,
    isPending: isCreateSchoolLoading,
  } = useMutation({ mutationFn: Mutations.createSchool, ...mutateOptions });

  // mutate for edit an existing batch
  const { mutateAsync: editSchoolMutateAsync, isPending: isEditSchoolLoading } =
    useMutation({ mutationFn: Mutations.updateSchool, ...mutateOptions });

  const formik = useFormik<FormValues>({
    initialValues: {
      title: type === "update" && populatedData.name ? populatedData.name : "",
      district:
        type === "update" && populatedData.district._id
          ? populatedData.district._id
          : "",
      schoolClassification:
        type === "update" && populatedData.schoolClassification?._id
          ? populatedData.schoolClassification._id
          : "",
    },
    onSubmit: (values) => {
      const newGoals = goals.map((item) => ({
        ...item,
        promisingPractices: item.promisingPractices.map((val) => val._id),
        studentCharacteristics: item.studentCharacteristics.map(
          (val) => val._id
        ),
        successSigns: item.successSigns.map((val) => val._id),
      }));

      if (populatedData && type === "update") {
        // update
        editSchoolMutateAsync({
          name: values.title,
          district: values.district,
          schoolClassification: values.schoolClassification,
          schoolGoals: newGoals,
          _id: populatedData._id,
        });
        return;
      }

      // create
      createSchoolMutateAsync({
        name: values.title,
        district: values.district,
        schoolClassification: values.schoolClassification,
        schoolGoals: newGoals,
      });
    },
    validationSchema: Yup.object({}).shape({
      title: Yup.string().required("Title is required"),
      district: Yup.string().required("District is required"),
    }),
  });

  const {
    handleChange,
    handleSubmit,
    values: { title, district, schoolClassification },
    errors: { title: titleError, district: districtError, schoolClassification: schoolClassificationError },
    isValid,
    isSubmitting,
    handleBlur,
  } = formik;

  const onMasterCheckBoxChange = (value: GoalType) => {
    const alreadyChecked = goals
      .map((item) => {
        return item.goal._id === value._id;
      })
      .includes(true);

    if (alreadyChecked) {
      const filtered = goals.filter((item) => item.goal._id !== value._id);
      setGoals(filtered);
      return;
    }

    setGoals([
      ...goals,
      {
        goal: { ...value },
        promisingPractices: [],
        studentCharacteristics: [],
        successSigns: [],
      },
    ]);
  };

  const onRelationalCheckBoxChange = (
    value: {
      goal: GoalType;
      type: PromisingPracticeType | SuccessSignType | StudentCharacteristicType;
    },
    key: "promisingPractices" | "studentCharacteristics" | "successSigns"
  ) => {
    const alreadyCheccked = goals
      .map((item) => {
        return (
          item.goal._id === value.goal._id &&
          item[key]
            .map((obj) => {
              return obj._id === value.type._id;
            })
            .includes(true)
        );
      })
      .includes(true);

    if (alreadyCheccked) {
      const updated = goals.map((item) => {
        if (item.goal._id === value.goal._id) {
          item[key] = item[key].filter((obj) => {
            return obj._id !== value.type._id;
          });
          return {
            ...item,
          };
        }
        return item;
      });
      setGoals(updated);
      return;
    }

    const temp = goals.map((item) => {
      if (item.goal._id === value.goal._id) {
        item[key] = [...item[key], value.type];
        return {
          ...item,
        };
      }
      return item;
    });

    setGoals(temp);
  };

  /**
   *
   * @Effects
   */

  useEffect(() => {
    // get the district goals
    if (type === "create") {
      const selectedDistrict = districts.filter(
        (dist) => dist._id === district
      )[0];
      if (selectedDistrict && Array.isArray(selectedDistrict.districtGoals)) {
        setGoals(selectedDistrict.districtGoals as any[]);
      }
    }
    //set the school goals to the district goals
  }, [district, type]);

  return (
    <div className="flex flex-col gap-10 px-10">
      <div className="flex justify-between">
        <div className="flex items-start flex-col font-bold justify-start">
          <div className="flex items-center -ml-4 text-[#00808099] ">
            <BsDot className="" size="35px" />
            <h4 className="text-xs  uppercase">School</h4>
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
          <Select
            options={districts.map((district) => ({
              label: district.name,
              value: district._id,
            }))}
            label="District"
            onChange={handleChange}
            value={district}
            name="district"
            placeholder="Select a district"
            errorMessage={districtError}
          />
          <Select
            options={schoolClassifications.map((schoolClassification) => ({
              label: schoolClassification.name,
              value: schoolClassification._id,
            }))}
            label="School Classification"
            onChange={handleChange}
            value={schoolClassification}
            name="schoolClassification"
            placeholder="Select a school classification"
            errorMessage={schoolClassificationError}
          />
          {allGoals.map((goal) => (
            <CheckboxAndRelations
              masterCheckbox={{ goal }}
              key={goal._id}
              relationalCheckboxes={[
                {
                  promisingPractices: !promisingPractices
                    ? []
                    : promisingPractices,
                  studentCharacteristics: !studentCharacteristics
                    ? []
                    : studentCharacteristics,
                  successSigns: !successSigns ? [] : successSigns,
                },
              ]}
              selectedValues={goals}
              onMasterCheckBoxChange={onMasterCheckBoxChange}
              onRelationalCheckBoxChange={onRelationalCheckBoxChange}
            />
          ))}
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
            type === "update" ? isEditSchoolLoading : isCreateSchoolLoading
          }
        />
      </div>
    </div>
  );
};
