import { UserType } from "../../core";
import {
  IDashboardFilterState,
  IUpdateDashboardDataQueryPayload,
} from "../../hooks/dashboard/interface";
import { transformTimePeriodToDateString } from "../../utils";

export const makeUpdateDashboardQueryPayload = (
  filter: IDashboardFilterState,
  user: UserType
) => {
  if (!user) return {} as any;
  const payload: Partial<IUpdateDashboardDataQueryPayload> = {};
  const {
    district,
    characteristic,
    dataSource,
    goal,
    promisingPractice,
    school,
    storyType,
    successSign,
    team,
    user: selectedUser,
    timePeriod,
    insightsSchool,
    insightsGoal,
    insightsTimePeriod,
  } = filter;

  const districtSelectedAndNotAll = district?.key && district?.key !== "All";
  const schoolSelectedAndNotAll = school?.key && school?.key !== "All";
  const teamSelectedAndNotAll = team?.key && team?.key !== "All";
  const userSelectedAndNotAll =
    selectedUser?.key && selectedUser?.key !== "All";
  const goalSelectedAndNotAll = goal?.key && goal?.key !== "All";
  const signSelectedAndNotAll = successSign?.key && successSign?.key !== "All";
  const characteristicSelectedAndNotAll =
    characteristic?.key && characteristic?.key !== "All";
  const practiceSelectedAndNotAll =
    promisingPractice?.key && promisingPractice?.key !== "All";
  const fetchLessonsLearned = storyType === "Lesson Learned";
  const fetchMyStories = dataSource === "user-stories";

  if (
    (user.permissionLevel === "Admin" ||
      user.permissionLevel === "Organization Leader") &&
    districtSelectedAndNotAll
  ) {
    payload.district = district?.key;
  } else {
    payload.district = user.district?._id;
  }

  if (dataSource === "insights") {
    // for the Insights Dashboard, many filters are not available for setting, and should be defaulted to "All"
    // the filters that can be set should be taken from the insights properties, not the regular properties

    // Assign school_id if school is selected
    if (insightsSchool?.key && insightsSchool?.key !== "All") {
      payload.school = insightsSchool?.key;
    }

    if (insightsGoal?.key && insightsGoal?.key !== "All") {
      payload.goal = insightsGoal?.key;
    }

    const fromDate = transformTimePeriodToDateString(
      insightsTimePeriod?.fromYear,
      insightsTimePeriod?.fromMonth
    );
    const toDate = transformTimePeriodToDateString(
      insightsTimePeriod?.toYear,
      insightsTimePeriod?.toMonth
    );
    payload.fromDate = fromDate;
    payload.toDate = toDate;

    payload.insights = true;
  } else {
    // Assign school_id if school is selected
    if (schoolSelectedAndNotAll) {
      payload.school = school?.key;
    }

    if (teamSelectedAndNotAll) {
      payload.team = team.key;
    }
    if (goalSelectedAndNotAll) {
      payload.goal = goal?.key;
    }
    if (signSelectedAndNotAll) {
      payload.successSign = successSign?.key;
    }
    if (practiceSelectedAndNotAll) {
      payload.promisingPractices = promisingPractice?.key;
    }
    if (characteristicSelectedAndNotAll) {
      payload.studentCharacteristics = characteristic?.key;
    }
    if (fetchMyStories) {
      payload.userId = user?.id;
    } else if (userSelectedAndNotAll) {
      payload.userId = selectedUser?.key;
    }
    const fromDate = transformTimePeriodToDateString(
      timePeriod?.fromYear,
      timePeriod?.fromMonth
    );
    const toDate = transformTimePeriodToDateString(
      timePeriod?.toYear,
      timePeriod?.toMonth
    );
    payload.fromDate = fromDate;
    payload.toDate = toDate;

    payload.storyType = fetchLessonsLearned ? "LL" : "SW";

    payload.insights = false;
  }

  return payload as IUpdateDashboardDataQueryPayload;
};
