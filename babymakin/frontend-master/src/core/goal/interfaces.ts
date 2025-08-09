import { AttributeType } from "../attributes";

export type GoalType = {
  _id: string;
  name: string;
  isDistrictLevel: boolean;
};

export type TeamGoalType = {
  goal: GoalType;
  promisingPractices: AttributeType[];
  studentCharacteristics: AttributeType[];
  successSigns: AttributeType[];
};
