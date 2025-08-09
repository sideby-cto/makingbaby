import { SyntheticEvent } from "react";
import {
  DistrictType,
  SchoolType,
  TeamGoalType,
  TimePeriod,
} from "../../types";

export function isGoal(param: any): param is TeamGoalType {
  return param && typeof param === "object" && "goal" in param;
}

export function isDistrict(param: any): param is DistrictType {
  return param && "districtGoals" in param;
}

export function isSchool(param: any): param is SchoolType {
  return param && "goals" in param;
}

export function isSyntheticEvent(param: any): param is SyntheticEvent {
  return param && typeof param !== "string" && "target" in param;
}

export function isTimePeriod(param: any): param is TimePeriod {
  return (
    param &&
    "fromMonth" in param &&
    "fromYear" in param &&
    "toYear" in param &&
    "toMonth" in param
  );
}
