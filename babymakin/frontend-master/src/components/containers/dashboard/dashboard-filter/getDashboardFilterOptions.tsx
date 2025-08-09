import { Select } from "../../..";
import { MonthYearDateSelector } from "../../../shared";
import { DashboardFilterProps } from "./dashboardUtils";

const selectStyling =
  "w-full rounded-[5px] p-1.5 border-[1px] border-[#0000004D] bg-white text-sm focus:outline-none";

const labelClassStyling = "text-[#008080] text-sm font-bold";

// Some filter options are only available to certain types of users.
// With the exception of the specific options listed below, all
// options are available to user types.
//
// District:
// - Districts can only be filtered by Admin users.
//
// Schools
// - Schools can only be filtered by Admin users, District Leader or a school leader and staff.
//
// Teams:
// - Teams can only be filtered by Admin users, District Leader or a school leader and staff.

interface GetDashboardFilterOptionsProps extends DashboardFilterProps {}

export const getDashboardFilterOptions = ({
  isAdmin,
  isOrganizationLeader,
  isDistrictLeader,
  isSchoolLeaderOrStaff,
  isAtAllDataPage,
  isInsightsPage,
  districtOptions,
  handleOnChangeDistrict,
  filter,
  schoolOptions,
  handleOnChangeSchool,
  teamOptions,
  handleOnChangeTeam,
  personOptions,
  handleOnChangePerson,
  goalOptions,
  handleOnChangeGoal,
  storyTypeOptions,
  handleOnChangeStoryType,
  filterStateActions,
  signOptions,
  handleOnChangeSign,
  practiceOptions,
  handleOnChangePractice,
  characteristicOptions,
  handleOnChangeCharacteristic,
  months,
  years,
  selectTimePeriod,
}: GetDashboardFilterOptionsProps) =>
  [
    {
      component: (
        <Select
          className={selectStyling}
          options={districtOptions}
          label="District"
          onChange={handleOnChangeDistrict}
          value={filter.district?.key}
          name="district"
          placeholder="All Districts"
          errorMessage={""}
          labelClassName={labelClassStyling}
        />
      ),
      display: isAdmin || isOrganizationLeader,
    },
    {
      component: (
        <Select
          className={selectStyling}
          options={schoolOptions}
          label="School"
          onChange={handleOnChangeSchool}
          value={
            filter.dataSource === "insights"
              ? filter.insightsSchool?.key
              : filter.school?.key
          }
          name="school"
          placeholder="Select a school"
          errorMessage={""}
          labelClassName={labelClassStyling}
          allowNoneOption
        />
      ),
      display:
        isAdmin ||
        isSchoolLeaderOrStaff ||
        isDistrictLeader ||
        isOrganizationLeader,
    },
    {
      component: (
        <Select
          className={selectStyling}
          options={teamOptions}
          label="Team"
          onChange={handleOnChangeTeam}
          value={filter.team?.key}
          name="team"
          placeholder="Select a team"
          errorMessage={""}
          labelClassName={labelClassStyling}
          allowNoneOption
        />
      ),
      display:
        !isInsightsPage &&
        (isAdmin ||
          isDistrictLeader ||
          isSchoolLeaderOrStaff ||
          isOrganizationLeader),
    },
    {
      component: (
        <Select
          className={selectStyling}
          options={personOptions}
          label="Person"
          onChange={handleOnChangePerson}
          value={filter.user?.key}
          name="person"
          placeholder="Select a person"
          errorMessage={""}
          labelClassName={labelClassStyling}
          allowNoneOption
        />
      ),
      display:
        isAtAllDataPage &&
        !isInsightsPage &&
        (isAdmin ||
          isDistrictLeader ||
          isSchoolLeaderOrStaff ||
          isOrganizationLeader),
    },
    {
      component: (
        <Select
          className={selectStyling}
          options={goalOptions}
          label="Goal"
          onChange={handleOnChangeGoal}
          value={
            filter.dataSource === "insights"
              ? filter.insightsGoal?.key
              : filter.goal?.key
          }
          name="goal"
          placeholder="Select a goal"
          labelClassName={labelClassStyling}
          errorMessage={""}
          allowNoneOption
        />
      ),
      display: true,
    },
    {
      component: (
        <Select
          className={selectStyling}
          options={storyTypeOptions}
          label="Story Type"
          onChange={handleOnChangeStoryType}
          value={filter.storyType}
          name="storyType"
          placeholder="Select a Story Type"
          labelClassName={labelClassStyling}
          errorMessage={""}
          allowNoneOption
        />
      ),
      display: !isInsightsPage,
    },
    {
      component: (
        <Select
          className={selectStyling}
          options={practiceOptions}
          label="Promising Practice"
          onChange={handleOnChangePractice}
          value={filter.promisingPractice?.key}
          name="promisingPractice"
          placeholder="Select a Promising Practice"
          labelClassName={labelClassStyling}
          errorMessage={""}
          allowNoneOption
        />
      ),
      display: !isInsightsPage,
    },
    {
      component: (
        <Select
          className={selectStyling}
          options={signOptions}
          label="Success Sign"
          onChange={handleOnChangeSign}
          value={filter.successSign?.key}
          name="succeessSign"
          placeholder="Select a success sign"
          labelClassName={labelClassStyling}
          errorMessage={""}
          allowNoneOption
        />
      ),
      display: !isInsightsPage,
    },
    {
      component: (
        <Select
          className={selectStyling}
          options={characteristicOptions}
          label="Characteristic"
          onChange={handleOnChangeCharacteristic}
          value={filter.characteristic?.key}
          name="characteristic"
          placeholder="Select a Characteristic"
          labelClassName={labelClassStyling}
          errorMessage={""}
          allowNoneOption
        />
      ),
      display: !isInsightsPage,
    },
    {
      component: (
        <MonthYearDateSelector
          months={months}
          years={years}
          monthValue={
            filter.dataSource === "insights"
              ? filter.insightsTimePeriod?.fromMonth ?? ""
              : filter.timePeriod?.fromMonth ?? ""
          }
          yearValue={
            filter.dataSource === "insights"
              ? filter.insightsTimePeriod?.fromYear ?? ""
              : filter.timePeriod?.fromYear ?? ""
          }
          yearSelectorName="fromYear"
          monthSelectorName="fromMonth"
          onChangeMonth={selectTimePeriod}
          onChangeYear={selectTimePeriod}
          label="From"
        />
      ),
      display: true,
    },
    {
      component: (
        <MonthYearDateSelector
          label="To"
          months={months}
          years={years}
          monthValue={
            filter.dataSource === "insights"
              ? filter.insightsTimePeriod?.toMonth ?? ""
              : filter.timePeriod?.toMonth ?? ""
          }
          yearValue={
            filter.dataSource === "insights"
              ? filter.insightsTimePeriod?.toYear ?? ""
              : filter.timePeriod?.toYear ?? ""
          }
          yearSelectorName="toYear"
          monthSelectorName="toMonth"
          onChangeMonth={selectTimePeriod}
          onChangeYear={selectTimePeriod}
        />
      ),
      display: true,
    },
  ].filter((option) => option.display);
