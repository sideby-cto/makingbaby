import React from "react";
import {
  TeamGoalType,
  GoalType,
  PromisingPracticeType,
  StudentCharacteristicType,
  SuccessSignType,
} from "../../utils/types";
import { RenderCheckboxSublist } from './RenderCheckboxList'; // import sublist component

type MasterCheckBoxType = {
  goal: GoalType;
};

type RelationalCheckBoxType = {
  promisingPractices: PromisingPracticeType[];
  successSigns: SuccessSignType[];
  studentCharacteristics: StudentCharacteristicType[];
};

interface CheckboxAndRelationsProps {
  masterCheckbox: MasterCheckBoxType;
  relationalCheckboxes: RelationalCheckBoxType[];
  onMasterCheckBoxChange: (value: GoalType) => void;
  onRelationalCheckBoxChange: (
    value: {
      goal: GoalType;
      type: PromisingPracticeType | SuccessSignType | StudentCharacteristicType;
    },
    key: "promisingPractices" | "studentCharacteristics" | "successSigns"
  ) => void;
  selectedValues: Array<TeamGoalType>;
}

export const CheckboxAndRelations: React.FC<CheckboxAndRelationsProps> = ({
  masterCheckbox: { goal },
  relationalCheckboxes,
  onMasterCheckBoxChange,
  onRelationalCheckBoxChange,
  selectedValues,
}) => {
  const isMasterChecked = (goal: GoalType) => {
    return selectedValues.some(value => value.goal._id === goal._id);
  };

  const isRelationalChecked = (
    goal: GoalType,
    type: PromisingPracticeType | SuccessSignType | StudentCharacteristicType,
    key: "promisingPractices" | "studentCharacteristics" | "successSigns"
  ) => {
    // check goal id and type id for each sublist item
    const isChecked = selectedValues
      .some(value => value.goal._id === goal._id 
        && value[key].some(item => item._id === type._id))

    return isChecked;
  };

  ///
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <input
          onChange={() => onMasterCheckBoxChange(goal)}
          checked={isMasterChecked(goal)}
          type="checkbox"
          name={goal.name}
        />
        <label htmlFor={goal.name} className="text-xs">
          {goal.name}
        </label>
      </div>

      {/* Render corresponding sublists under selected goals */}
      {isMasterChecked(goal) && (
        <div className="ml-10 bg-[#0000001A] p-5 rounded">
          {relationalCheckboxes.map(({ promisingPractices, studentCharacteristics, successSigns }, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <RenderCheckboxSublist
                title="Promising Practices"
                items={promisingPractices}
                goal={goal}
                onRelationalCheckBoxChange={onRelationalCheckBoxChange}
                checkedFunction={isRelationalChecked}
                checkboxKey="promisingPractices"
              />
              <RenderCheckboxSublist
                title="Student Characteristics"
                items={studentCharacteristics}
                goal={goal}
                onRelationalCheckBoxChange={onRelationalCheckBoxChange}
                checkedFunction={isRelationalChecked}
                checkboxKey="studentCharacteristics"
              />
              <RenderCheckboxSublist
                title="Success Signs"
                items={successSigns}
                goal={goal}
                onRelationalCheckBoxChange={onRelationalCheckBoxChange}
                checkedFunction={isRelationalChecked}
                checkboxKey="successSigns"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
