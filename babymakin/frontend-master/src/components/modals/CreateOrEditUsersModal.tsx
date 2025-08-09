import { FocusError } from "focus-formik-error";
import { useFormik } from "formik";
import React, { useId, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import * as Yup from "yup";
import {
  getListasKeys,
  Toastify,
  UserPermissions,
  _useMutateCollections,
} from "../../utils";
import {
  OrganizationType,
  DistrictType,
  SchoolType,
  TeamType,
  UserStatusType,
  UserType,
} from "../../utils/types";
import { FormSubmitButton } from "../buttons";
import { TextInput, Select } from "../inputs";

interface Props {
  onCloseModalClick: () => void;
  type: "update" | "create";
  populatedData?: UserType;
  organizations: OrganizationType[];
  districts: DistrictType[];
  schools: SchoolType[];
  teams: TeamType[];
  refetch: () => void;
}

interface FormValues {
  name: string;
  email: string;
  permissionLevel: UserStatusType | "";
  mainTeam?: string;
  district: string;
  organization: string;
}

export const CreateOrEditUsersModal: React.FC<Props> = ({
  onCloseModalClick,
  type,
  organizations: allOrganizations,
  districts: allDistricts,
  schools: allSchools,
  teams: allTeams,
  refetch,
  populatedData,
}) => {
  const isUpdate = type === "update";
  const isCreate = type === "create";

  const [schools, setSchools] = useState<SchoolType[]>(
    isUpdate && populatedData?.schools ? populatedData.schools : []
  );
  const [teams, setTeams] = useState<TeamType[]>(
    isUpdate && populatedData?.teams ? populatedData.teams : []
  );
  const selectedTeamKeys = useMemo(() => getListasKeys(teams), [teams]);

  const selectedSchoolKeys = useMemo(() => getListasKeys(schools), [schools]);

  const modalHeader = isCreate ? "Add a new user" : populatedData?.name;
  const buttonTitle = isCreate ? "Add User" : "Save Changes";
  const inputElementId = useId();

  /**@API-Hanlders */
  const onCreateUserHandler = () => {
    refetch();
    onCloseModalClick();
  };
  const { handler: createUserFunction, isPending: isCreatingUser } =
    _useMutateCollections({
      mutation: "createUser",
      successCallback: onCreateUserHandler,
    });
  const { handler: updateUserFunction, isPending: isUpdatingUser } =
    _useMutateCollections({
      mutation: "updateUser",
      successCallback: onCreateUserHandler,
      errorMessage: "Failed to update user",
    });

  /**@FormikConfig */
  const formik = useFormik<FormValues>({
    initialValues: {
      email: isUpdate && populatedData?.email ? populatedData.email : "",
      name: isUpdate && populatedData?.name ? populatedData.name : "",
      permissionLevel:
        isUpdate && populatedData?.permissionLevel
          ? populatedData.permissionLevel
          : "",
      district:
        isUpdate && populatedData?.district ? populatedData?.district._id : "",
      organization:
        isUpdate && populatedData?.organization
          ? populatedData?.organization._id
          : "",
    },
    onSubmit: (values) => {
      if (values.permissionLevel === "District Leader" && !values.district) {
        Toastify("warn", "Please select a district");
        return;
      }

      if (
        values.permissionLevel === "Organization Leader" &&
        !values.organization
      ) {
        Toastify("warn", "Please select an organization");
        return;
      }

      let userObj: any = {
        ...values,
        schools: schools.map((sch) => sch._id),
        teams: teams.map((tm) => tm._id),
      };

      if (!values.district) {
        delete userObj["district"];
      }
      if (!values.organization) {
        delete userObj["organization"];
      }
      if (populatedData && isUpdate) {
        //update user
        const updateUserConfig = {
          ...userObj,
          id: (populatedData as any).id,
        };
        updateUserFunction(updateUserConfig);
        return;
      }
      // create user
      createUserFunction(userObj);
    },
    validationSchema: Yup.object({}).shape({
      email: Yup.string().required("Please enter an email"),
      name: Yup.string().required("Please enter a name"),
      permissionLevel: Yup.string().required("Assign a permission level"),
    }),
  });

  /**@FormikData */
  const {
    handleChange,
    handleSubmit,
    values: { email, name, permissionLevel, district, organization },
    errors: {
      email: emailError,
      name: nameError,
      permissionLevel: permissionLevelError,
    },
    isValid,
    isSubmitting,
    handleBlur,
  } = formik;

  /**
   * @Handlers
   * Selecting school logic
   *
   */
  const selectSchoolHandler = (school: SchoolType) => {
    const isChecked = schools.some((sch) => sch._id === school._id);
    if (!isChecked) {
      setSchools([...schools, school]);
    } else {
      const filteredSchools = schools.filter((sch) => sch._id !== school._id);
      setSchools(filteredSchools);
    }
  };

  const selectTeamHandler = (team: TeamType) => {
    const isChecked = teams.some((tm) => tm._id === team._id);
    if (!isChecked) {
      setTeams([...teams, team]);
    } else {
      const filteredTeams = teams.filter((tm) => tm._id !== team._id);
      setTeams(filteredTeams);
    }
  };

  return (
    <div className="w-full">
      <div className="flex w-full justify-between">
        <div className="flex items-start flex-col font-bold justify-start">
          <div className="flex items-center -ml-4 text-[#00808099] ">
            <BsDot className="" size="35px" />
            <h4 className="text-xs  uppercase">User</h4>
          </div>
          <h2 className="text-[#008080] -mt-2 text-lg">{modalHeader}</h2>
        </div>
        <AiOutlineClose
          className="hover:text-red-600 transition-all duration-200 cursor-pointer hover:scale-110 transform"
          size="20px"
          onClick={onCloseModalClick}
        />
      </div>
      <form>
        <FocusError formik={formik} />
        <div className="flex flex-col gap-2 space-y-5">
          <TextInput
            id={`${inputElementId}-title`}
            name="name"
            label="Name"
            onChange={handleChange}
            value={name}
            onBlur={handleBlur}
            errorMessage={nameError}
          />
          <TextInput
            id={`${inputElementId}-title`}
            name="email"
            label="Email"
            onChange={handleChange}
            value={email}
            onBlur={handleBlur}
            errorMessage={emailError}
          />
          <Select
            options={UserPermissions.map((permission) => ({
              label: permission,
              value: permission,
            }))}
            label="Permission level"
            onChange={handleChange}
            value={permissionLevel}
            name="permissionLevel"
            placeholder="Select permission level"
            errorMessage={permissionLevelError}
          />
          <>
            {permissionLevel === "Organization Leader" && (
              <Select
                options={allOrganizations.map((organization) => ({
                  label: organization.name,
                  value: organization._id,
                }))}
                label="Organization"
                onChange={handleChange}
                value={organization}
                name="organization"
                placeholder="Select User Organization"
                errorMessage={permissionLevelError}
              />
            )}
            {permissionLevel === "District Leader" && (
              <Select
                options={allDistricts.map((district) => ({
                  label: district.name,
                  value: district._id,
                }))}
                label="District"
                onChange={handleChange}
                value={district}
                name="district"
                placeholder="Select User District"
                errorMessage={permissionLevelError}
              />
            )}
            {permissionLevel !== "Organization Leader" &&
              permissionLevel !== "Admin" && (
                <div className="flex flex-col bg-[#000]/20 px-2 py-4">
                  <p className="text-[#00000080] text-xs font-bold">
                    Assign Schools
                  </p>
                  <div className="flex flex-col pl-5">
                    {allSchools.map((sch) => {
                      return (
                        <div key={sch._id} className="space-x-3">
                          <input
                            type="checkbox"
                            name={sch.name}
                            id={sch.name}
                            checked={selectedSchoolKeys[sch._id] ? true : false}
                            onChange={() => selectSchoolHandler(sch)}
                          />
                          <label htmlFor={sch.name}>{sch.name}</label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </>
          {permissionLevel !== "Organization Leader" &&
            permissionLevel !== "Admin" && (
              <>
                <div className="flex flex-col bg-[#000]/20 px-2 py-4">
                  <p className="text-sm font-interMedium">Assign Teams</p>
                  <div className="flex flex-col pl-5">
                    {allTeams.map((team) => (
                      <div key={team._id} className="space-x-3">
                        <input
                          checked={selectedTeamKeys[team._id] ? true : false}
                          type="checkbox"
                          name={team.name}
                          id={team.name}
                          onChange={() => selectTeamHandler(team)}
                        />
                        <label htmlFor={team.name}>{team.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
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
          loading={type === "create" ? isCreatingUser : isUpdatingUser}
        />
      </div>
    </div>
  );
};
