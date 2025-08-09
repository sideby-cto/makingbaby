import React, { useId, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FocusError } from "focus-formik-error";
import { AxiosError } from "axios";
import { Mutations } from "../../api";
import { FormSubmitButton } from "../buttons";
import { CheckboxAndRelations, TextInput, Select } from "../inputs";
import {
  OrganizationType,
  TeamGoalType,
  GoalType,
  ModalProps,
  PromisingPracticeType,
  StudentCharacteristicType,
  SuccessSignType,
} from "../../utils/types";
import { MdOutlineTableRows } from "react-icons/md";

interface FormValues {
  title: string;
  organization: string;
}

export const CreateOrEditDistrictModal: React.FC<
  ModalProps & {
    isLoading: boolean;
    checkBoxData: {
      goals: GoalType[];
      promisingPractices: PromisingPracticeType[];
      successSigns: SuccessSignType[];
      studentCharacteristics: StudentCharacteristicType[];
    };
    organizations: OrganizationType[];
  }
> = ({
  onCloseModalClick,
  type,
  populatedData,
  refetch,
  isLoading,
  checkBoxData: {
    goals,
    promisingPractices,
    studentCharacteristics,
    successSigns,
  },
  organizations,
}) => {
  const inputElementId = useId();
  const [districtGoals, setDistrictGoals] = useState<TeamGoalType[]>(
    populatedData.districtGoals ? populatedData.districtGoals : []
  );

  /**@log */
  const modalHeader =
    type === "create" ? "Add a new district" : populatedData?.name;
  const buttonTitle = type === "create" ? "Add District" : "Save Changes";

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
    mutateAsync: createDistrictMutateAsync,
    isPending: isCreateDistrictLoading,
  } = useMutation({ mutationFn: Mutations.createDistrict, ...mutateOptions });

  // mutate for edit an existing batch
  const {
    mutateAsync: editDistrictMutateAsync,
    isPending: isEditDistrictLoading,
  } = useMutation({ mutationFn: Mutations.updateDistrict, ...mutateOptions });

  const formik = useFormik<FormValues>({
    initialValues: {
      title: type === "update" && populatedData.name ? populatedData.name : "",
      organization:
        type === "update" && populatedData.organization?._id
          ? populatedData.organization._id
          : "",
    },
    onSubmit: (values) => {
      if (populatedData && type === "update") {
        // update
        editDistrictMutateAsync({
          districtGoals,
          name: values.title,
          organization: values.organization,
          _id: populatedData._id,
        });
        return;
      }
      // create
      const newDistrictGoals = districtGoals.map((item) => ({
        goal: item.goal._id,
        promisingPractices: item.promisingPractices.map((val) => val._id),
        studentCharacteristics: item.studentCharacteristics.map(
          (val) => val._id
        ),
        successSigns: item.successSigns.map((val) => val._id),
      }));
      createDistrictMutateAsync({
        districtGoals: newDistrictGoals,
        name: values.title,
        organization: values.organization,
      });
    },
    validationSchema: Yup.object({}).shape({
      title: Yup.string().required("Name is required"),
    }),
  });

  const {
    handleChange,
    handleSubmit,
    values: { title, organization },
    errors: { title: titleError, organization: organizationError },
    isValid,
    isSubmitting,
    handleBlur,
  } = formik;

  const onMasterCheckBoxChange = (value: GoalType) => {
    const alreadyChecked = districtGoals
      .map((item: any) => {
        return item.goal._id === value._id;
      })
      .includes(true);

    if (alreadyChecked) {
      const filtered = districtGoals.filter((item: any) => {
        return item.goal._id !== value._id;
      });
      setDistrictGoals(filtered);
      return;
    }
    const obj = {
      goal: { ...value },
      promisingPractices: [],
      studentCharacteristics: [],
      successSigns: [],
    };
    setDistrictGoals([...districtGoals, obj]);
  };

  const onRelationalCheckBoxChange = (
    value: {
      goal: GoalType;
      type: PromisingPracticeType | SuccessSignType | StudentCharacteristicType;
    },
    key: "promisingPractices" | "studentCharacteristics" | "successSigns"
  ) => {
    const alreadyCheccked = districtGoals
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
      const updated = districtGoals.map((item) => {
        if (
          item.goal._id === value.goal._id ||
          ((item as any).goal as GoalType)._id === value.goal._id
        ) {
          item[key] = item[key].filter((obj) => {
            return obj._id !== value.type._id;
          });
          return {
            ...item,
          };
        }
        return item;
      });
      setDistrictGoals(updated);
      return;
    }

    const temp = districtGoals.map((item) => {
      if (
        item.goal._id === value.goal._id ||
        ((item as any).goal as GoalType)._id === value.goal._id
      ) {
        item[key] = [...item[key], value.type];
        return {
          ...item,
        };
      }
      return item;
    });

    setDistrictGoals(temp);
  };

  ///
  return (
    <div className="flex flex-col gap-10 px-10">
      <div className="flex justify-between">
        <div className="flex items-start flex-col font-bold justify-start">
          <div className="flex items-center -ml-4 text-[#00808099] ">
            <BsDot className="" size="35px" />
            <h4 className="text-xs  uppercase">District</h4>
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
            label="Name"
            onChange={handleChange}
            value={title}
            errorMessage={titleError}
            onBlur={handleBlur}
          />
          <Select
            options={organizations.map((organization) => ({
              label: organization.name,
              value: organization._id,
            }))}
            label="Organization"
            onChange={handleChange}
            value={organization}
            name="organization"
            placeholder="Select an organization"
            errorMessage={organizationError}
          />
          {!goals ? (
            <div className="flex flex-col space-y-3 py-4 w-full h-full justify-center items-center">
              <MdOutlineTableRows color="#000" size="20px" />
              <p className="text-sm font-interBold text-black">No Goals</p>
            </div>
          ) : (
            goals.map((goal: any) => (
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
                selectedValues={districtGoals}
                onMasterCheckBoxChange={onMasterCheckBoxChange}
                onRelationalCheckBoxChange={onRelationalCheckBoxChange}
              />
            ))
          )}
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
          loading={
            type === "update" ? isEditDistrictLoading : isCreateDistrictLoading
          }
        />
      </div>
    </div>
  );
};
