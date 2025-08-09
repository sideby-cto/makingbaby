import { GoalType } from "../goal";
import { SchoolType }  from "../school";

export type TeamType = {
  _id: string;
  createdAt: Date;
  name: string;
  teamGoals: GoalType[];
  school: SchoolType;
};
