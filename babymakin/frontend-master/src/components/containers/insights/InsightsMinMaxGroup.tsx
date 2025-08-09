import React from "react";

import { InsightsMinMaxContainer } from "src/components";
import { IndicatorSet } from "src/hooks/insights";
import { useMinMaxIndicators } from "src/hooks/insights";

const kSuccessPPMaxSubtitle : string = "Most Utilized Promising Practices";
const kSuccessPPMinSubtitle : string = "Least Utilized Promising Practices";

const kSuccessSSMaxSubtitle : string = "Most Observed Success Signs";
const kSuccessSSMinSubtitle : string = "Least Observed Success Signs";

const kSuccessSCMaxSubtitle : string = "Most Represented Characteristics";
const kSuccessSCMinSubtitle : string = "Least Represented Characteristics";

const kLessonsLearnedPPMaxSubtitle : string = "Most Attempted Promising Practices";
const kLessonsLearnedMaxSSTitle : string =    "Success Signs We Most Hoped to See";
const kLessonsLearnedMaxSCTitle : string =     "Most Represented Characteristics";


interface MinMaxGroupProps {
  data: IndicatorSet;
  stories: any;
  title: string;
  showMinGraphs: boolean;
  isLessonsLearned: boolean;
  loading?: boolean;
}

export const InsightsMinMaxGroupContainer: React.FC<MinMaxGroupProps> = ({
  data,
  stories,
  title,
  showMinGraphs,
  isLessonsLearned,
  loading
}) => {
  
  const { ppIndicatorSet, ssIndicatorSet, scIndicatorSet  } = useMinMaxIndicators( data, stories );

  const kMaxPPSubtitle = isLessonsLearned ? kLessonsLearnedPPMaxSubtitle : kSuccessPPMaxSubtitle;
  const kMinPPSubtitle = isLessonsLearned ? "" : kSuccessPPMinSubtitle;

  const kMaxSSSubtitle = isLessonsLearned ? kLessonsLearnedMaxSSTitle : kSuccessSSMaxSubtitle;
  const kMinSSSubtitle = isLessonsLearned ? "" : kSuccessSSMinSubtitle;

  const kMaxSCSubtitle = isLessonsLearned ? kLessonsLearnedMaxSCTitle : kSuccessSCMaxSubtitle;
  const kMinSCSubtitle = isLessonsLearned ? "" : kSuccessSCMinSubtitle;


  return (
    <div
      className={
        "flex-1 flex-col space-y-3 p-3 bg-white drop-shadow-md rounded-md"
      }
    >
      <span className="block flex text-defaultText text-xl font-interBold pb-3 border-[#000]/10 border-b-[1px]">
        {title}
      </span>

      <div className="flex flex-col w-full h-fit mt-10 pb-10 lg-graph:flex-row justify-between gap-y-8 lg-graph:space-y-0">
        <InsightsMinMaxContainer
          maxSubtitle = {kMaxPPSubtitle}
          minSubtitle = {kMinPPSubtitle}
          data={ppIndicatorSet}
          showMinGraphs={showMinGraphs}
          isLessonsLearned={isLessonsLearned}
          loading={loading}
          minMaxContainerClassName="absolute top-0 flex ml-[0%] w-full h-[450px]"
        />
        <InsightsMinMaxContainer
          maxSubtitle = {kMaxSSSubtitle}
          minSubtitle = {kMinSSSubtitle}
          data={ssIndicatorSet}
          showMinGraphs={showMinGraphs}         
          isLessonsLearned={isLessonsLearned}
          loading={loading}
          minMaxContainerClassName="absolute top-0 flex ml-[0%] w-full h-[450px]"
        />
        <InsightsMinMaxContainer
          maxSubtitle = {kMaxSCSubtitle}
          minSubtitle = {kMinSCSubtitle}
          data={scIndicatorSet}
          showMinGraphs={showMinGraphs}
          isLessonsLearned={isLessonsLearned}
          loading={loading}
          minMaxContainerClassName="absolute top-0 flex ml-[0%] w-full h-[450px]"
        />
    </div> 

   </div>
  );
};






