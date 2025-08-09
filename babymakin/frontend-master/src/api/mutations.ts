// all mutation functions for react-query should be written here
import {
  GoalType,
  PromisingPracticeType,
  SuccessSignType,
  UserType,
  CreateGoalType,
  CreatePromisingPracticeType,
  CreateSuccessSignType,
  CreateOrganizationType,
  CreateDistrictType,
  CreateTeamType,
  CreateSchoolType,
  CreateSchoolClassificationType,
  CreateStudentCharacteristicType,
  StudentCharacteristicType,
  StoryReactionPayload,
} from "../utils/types";
import { API, ENDPOINTS, FormDataAPI } from "./http-common";

const {
  goals,
  promisingPractice,
  studentSuccessSign,
  studentCharacteristics,
  organizations,
  districts,
  teams,
  schools,
  schoolClassifications,
  users,
  login,
  story,
  storyReaction,
  notification,
} = ENDPOINTS;

export const Mutations = {
  createGoal: async (data: CreateGoalType) => {
    await API.post(goals, data);
    return;
  },
  createSuccessSign: async (data: CreateSuccessSignType) => {
    await API.post(studentSuccessSign, data);
    return;
  },
  createPromisingPractice: async (data: CreatePromisingPracticeType) => {
    await API.post(promisingPractice, data);
    return;
  },
  createStdCharacteristics: async (data: CreateStudentCharacteristicType) => {
    await API.post(studentCharacteristics, data);
    return;
  },
  createOrganization: async (data: CreateOrganizationType) => {
    await API.post(organizations, data);
    return;
  },
  createDistrict: async (data: CreateDistrictType) => {
    await API.post(districts, data);
    return;
  },
  createTeam: async (data: CreateTeamType) => {
    await API.post(teams, data);
    return;
  },
  createSchool: async (data: CreateSchoolType) => {
    await API.post(schools, data);
    return;
  },
  createSchoolClassification: async (data: CreateSchoolClassificationType) => {
    await API.post(schoolClassifications, data);
    return;
  },
  createUser: async (data: Omit<UserType, "createdAt">) => {
    await API.post(users, data);
  },
  createStory: async (data: any) => {
    await FormDataAPI.post(story, data);

    const taggedUsersId = data.getAll("taggedUsersId");
    if (taggedUsersId.length > 0) {
      const storyAuthorId = data.get("userId");
      const notificationType = "tagging";
      const postedBy = data.get("author");

      await API.post(notification, { storyAuthorId, taggedUsersId, notificationType, postedBy });
    }
  },
  editStory: async (data: any) => {
    const { id, params } = data;
    await FormDataAPI.patch(`${story}/${id}`, params);

    const taggedUsersId = params.getAll("taggedUsersId");
        
    if (taggedUsersId.length > 0) {
      const storyAuthorId = params.get("userId");
      const notificationType = "tagging";
      const postedBy = params.get("author");

      await API.post(notification, { storyAuthorId, taggedUsersId, notificationType, postedBy });
    }
  },
  deleteStory: async (data: any) => {
    const { id } = data;
    const path = `${story}/${id}`;
    await API.delete(path);
  },
  updateGoal: async (data: GoalType) => {
    await API.patch(`${goals}/${data._id}`, data);
    return;
  },
  updateSuccessSign: async (data: SuccessSignType) => {
    await API.patch(`${studentSuccessSign}/${data._id}`, data);
    return;
  },
  updatePromisingPractice: async (data: PromisingPracticeType) => {
    await API.patch(`${promisingPractice}/${data._id}`, data);
    return;
  },
  updateStdCharacteristics: async (data: StudentCharacteristicType) => {
    await API.patch(`${studentCharacteristics}/${data._id}`, data);
    return;
  },
  updateOrganization: async (data: any) => {
    await API.patch(`${organizations}/${data._id}`, data);
    return;
  },
  updateDistrict: async (data: any) => {
    await API.patch(`${districts}/${data._id}`, data);
    return;
  },
  updateTeam: async (data: any) => {
    await API.patch(`${teams}/${data._id}`, data);
    return;
  },
  updateSchool: async (data: any) => {
    await API.patch(`${schools}/${data._id}`, data);
    return;
  },
  updateSchoolClassification: async (data: any) => {
    await API.patch(`${schoolClassifications}/${data._id}`, data);
    return;
  },
  updateUser: async (data: any) => {
    await API.patch(`${users}/${data.id}`, data);
  },
  deleteData: async (data: { _id: string; route: string }) => {
    await API.delete(`${data.route}/${data._id}`);
    return;
  },
  /**@Story */
  addReactionToStory: async (payload: StoryReactionPayload) => {
    await API.post(storyReaction, payload);
    return;
  },
  /**@Auth */
  loginUser: async (data: { email: string }) => {
    await API.post(login, data);
    return;
  },
};
