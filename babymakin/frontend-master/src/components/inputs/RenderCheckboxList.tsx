import React from "react";
import {
  GoalType,
  PromisingPracticeType,
  SuccessSignType,
  StudentCharacteristicType,
} from "../../utils/types";

// Declare parameter type for RenderCheckboxList component
interface RenderCheckboxSublistProps {
  title: string;
  items: Array<PromisingPracticeType | SuccessSignType | StudentCharacteristicType>;
  goal: GoalType;
  onRelationalCheckBoxChange: (
    value: {
      goal: GoalType;
      type: PromisingPracticeType | SuccessSignType | StudentCharacteristicType;
    },
    key: "promisingPractices" | "studentCharacteristics" | "successSigns"
  ) => void;
  checkedFunction: (
    goal: GoalType,
    type: PromisingPracticeType | SuccessSignType | StudentCharacteristicType,
    key: "promisingPractices" | "studentCharacteristics" | "successSigns"
  ) => boolean;
  checkboxKey: "promisingPractices" | "studentCharacteristics" | "successSigns";
}

// RenderCheckboxSublist component 
// showing "promisingPractices", "studentCharacteristics", "successSigns" sublists
export const RenderCheckboxSublist: React.FC<RenderCheckboxSublistProps> = ({
  title,
  items,
  goal,
  onRelationalCheckBoxChange,
  checkedFunction,
  checkboxKey,
}) => (
  <div className="flex flex-col gap-2">
    <h4 className="text-[#00000080] text-xs font-bold">
      Add Related {title}
    </h4>
    {items.length > 0 ? (
      items.map((item) => (
        <div key={item._id} className="flex gap-3">
          <input
            onChange={() => onRelationalCheckBoxChange({ goal, type: item }, checkboxKey)}
            checked={checkedFunction(goal, item, checkboxKey)}
            type="checkbox"
            name={item.name}
          />
          <label htmlFor={item.name} className="text-xs">
            {item.name}
          </label>
        </div>
      ))
    ) : (
      <h4 className="text-center text-xs">No {title}</h4>
    )}
  </div>
);
