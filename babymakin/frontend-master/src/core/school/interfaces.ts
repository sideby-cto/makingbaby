import { DistrictType } from "../district";
import { TeamGoalType } from "../goal";
import { SchoolClassificationType } from "../school-classification";

export type SchoolType = {
  _id: string;
  createdAt: Date;
  name: string;
  schoolGoals: TeamGoalType[];
  district: DistrictType;
  schoolClassification?: SchoolClassificationType;
};
