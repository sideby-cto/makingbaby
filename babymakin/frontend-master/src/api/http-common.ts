import axios, { InternalAxiosRequestConfig } from "axios";
const baseURL = process.env.REACT_APP_SMALL_WINS_API;

export const API = axios.create({
  baseURL,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
    "Access-Control-Allow-Credentials": true,
  },
});

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("userToken");

    if (token && config?.headers) {
      config.headers.userToken = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const FormDataAPI = axios.create({
  baseURL,
  headers: {
    Accept: "*/*",
    "Content-Type": "multipart/form-data",
  },
});

FormDataAPI.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("userToken");

    if (token && config?.headers) {
      config.headers.userToken = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const ENDPOINTS = {
  goals: "/goals",
  promisingPractice: "/promising-pratice",
  studentSuccessSign: "/student-success-sign",
  studentCharacteristics: "/student-characteristics",
  organizations: "/organizations",
  districts: "/districts",
  schools: "/schools",
  schoolClassifications: "/school-classifications",
  teams: "/teams",
  users: "/users",
  login: "/auth/login",
  story: "/story",
  storyReaction: "/story/react",
  dashboard: "/dashboard",
  notification: "/notification",
};
