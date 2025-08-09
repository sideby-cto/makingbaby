import {
  LocalStorageKeys,
  PromisingPracticeType,
  TeamGoalType,
} from "../../types";
import { jwtDecode } from "jwt-decode";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { flatten, uniqBy } from "lodash";

export const debounce = (cb: Function) => {
  let timer: NodeJS.Timeout | null;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer as NodeJS.Timeout);
    timer = setTimeout(() => {
      timer = null;
      cb.apply(this, args);
    }, 1000);
  };
};

export const DecodeToken = (token: string) => {
  return jwtDecode(token);
};

export const SaveOnLocalStorage = (key: LocalStorageKeys, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const ClearLocalStorage = (key: LocalStorageKeys) => {
  localStorage.removeItem(key);
};

export const GetFromLocalStorage = (key: LocalStorageKeys) => {
  const stringObj = localStorage.getItem(key as string);
  return stringObj ? JSON.parse(stringObj) : null;
};

export function endsWithChar(text: string, char: string) {
  return text.charAt(text.length - 1) === char;
}

export const _CreateMutationConfiguration = (
  successCallback: Function,
  errorCallback?: Function,
  errorMessage?: string,
  successMessage?: string
) => {
  return {
    onError: () => {
      if (errorMessage) {
        Toastify("error", errorMessage);
      }
      errorCallback && errorCallback();
    },
    onSuccess: () => {
      if (successMessage) {
        Toastify("success", successMessage);
      }
      successCallback && successCallback();
    },
  };
};

export const CreateMutationConfiguration = (successFunction?: Function) => {
  return {
    onError: (error: AxiosError) => {
      console.error(`${error.message}, Please try again!`, {
        className: "text-red-600",
      });
    },
    onSuccess: () => {
      successFunction && successFunction();
    },
  };
};

export const Toastify = (
  type: "success" | "error" | "warn",
  displayText: string
) => {
  toast[type](displayText);
};

export function GetItemByIdFromList(
  id: string | number,
  list: any[],
  key: string
) {
  return Array.isArray(list) &&
    typeof key === "string" &&
    (typeof id === "string" || "number")
    ? list.find((item) => item[key] === id)
    : undefined;
}

export function GetGoalFromTeamGoals(
  id: string | number,
  goals: TeamGoalType[]
) {
  return Array.isArray(goals)
    ? goals.find((goal) => goal.goal._id === id)
    : undefined;
}

export async function GetImageBlob(url: any) {
  const image = await fetch(url);
  const blob = await image.blob();
  return blob;
}

export const DownloadAttachments = async (files: any[]) => {
  for (const file of files) {
    const { url } = file;
    const filename = url.split("/").pop();
    const imageBlog = await GetImageBlob(url);
    const imageURL = URL.createObjectURL(imageBlog);
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "" + filename + "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const flattenAndUniqueById = (nestedArray: PromisingPracticeType[][]) =>
  uniqBy(flatten(nestedArray), "_id");

export const ExtractDataFromTeamGoals = ({
  goals,
  selectedGoalId,
}: {
  goals: TeamGoalType[];
  selectedGoalId: string | null;
}) => {
  const selectedGoals = selectedGoalId
    ? (goals || []).filter((goal) => goal.goal._id === selectedGoalId)
    : goals;

  return {
    allGoals: selectedGoals.map(({ goal }) => goal),
    allStudentCharacteristics: flattenAndUniqueById(
      selectedGoals.map((goal) => goal.studentCharacteristics)
    ),
    allPromisingPractices: flattenAndUniqueById(
      selectedGoals.map((goal) => goal.promisingPractices)
    ),
    allSuccessSigns: flattenAndUniqueById(
      selectedGoals.map((goal) => goal.successSigns)
    ),
  };
};

export function getMonthNames() {
  let months: string[] = [];
  for (let month = 1; month <= 12; month++) {
    const date = new Date(2022, month, 0);
    const monthName = date.toLocaleDateString("default", { month: "long" });
    months.push(monthName);
  }
  return months;
}

export function getYearOptions() {
  // If the current month is before August, the end year is the current year
  // Otherwise, the end year is the next year
  let endYear: number;
  if (new Date().getMonth() < 7) {
    endYear = new Date().getFullYear();
  } else {
    endYear = new Date().getFullYear() + 1;
  }
  let years: string[] = [];
  for (let year = 2022; year <= endYear; year++) {
    years.push(year.toString());
  }
  return years;
}

export function getListasKeys(list: any[]) {
  return list.reduce(
    (curr: any, itm: any) => ({ ...curr, [itm._id]: true }),
    {}
  );
}

export function getDateFromTimePeriod(year: string, month: string) {
  if (!year || !month) return;

  const _month = new Date(Date.parse(month + " 1, 2012")).getMonth();
  return new Date(parseInt(year), _month, 1);
}

export const transformTimePeriodToDateString = getDateFromTimePeriod;

export function getDateFormatForStory(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}
