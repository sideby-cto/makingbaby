import { MdOutlineFilterNone } from "react-icons/md";
import { Loading } from "src/components";
// @ts-ignore
import GaugeChart from 'react-gauge-chart'


interface ProgressProps {
  title: string;
  progressPercent: number;
  loading?: boolean;
  progressContainerClassName?: string;
  progressKeysContainerClassName?: string;
}

export const InsightsProgressContainer: React.FC<ProgressProps> = ({
  progressPercent,
  title,
  loading,
  progressContainerClassName,
}) => {

  // sanity check progressPercent
  progressPercent = progressPercent < 0.00 ? 0.00 : (progressPercent > 100.00 ? 100.00 : progressPercent)

  

  /**@RenderFn */

  const renderGauge = () => {
    return loading ? (
      <div className="flex w-full h-20 flex justify-center items-center">
        <Loading />
      </div>
    ) : (progressPercent >= 0.00) ? (
      <div className={progressContainerClassName}>
        <GaugeChart
          nrOfLevels={10}
          colors = {["#DDCABB", "#57BDA2"]}
          needleColor = {"#304A78"}
          percent={progressPercent/100} 
          arcWidth={.4}
          arcPadding={0.02}
          cornerRadius={2}
          textColor = {"#304A78"}
          hideText = {true}
        />
        <span className="flex text-md font-interMedium w-full text-center justify-center">
          {progressPercent.toString() + "% of Team Members shared a story"}
        </span>        
      </div>
    ) : (
      <div
        className={`flex flex-col space-y-5 w-full h-fit py-2 items-center justify-center`}
      >
        <MdOutlineFilterNone color="#000" size="32px" />
        <h2 className="text-md font-inter"> No data</h2>
      </div>
    );
  };

  return (
    <div
      className={
        "flex-1 flex-col space-y-3 p-3 bg-white drop-shadow-md rounded-md"
      }
    >
      <span className="block flex text-defaultText text-xl font-interBold pb-3 border-[#000]/10 border-b-[1px]">
        {title}
      </span>
      <div className="flex w-full space-x-10 pt-3 min-h-[100px] max-h-[250] min-h-[250] justify-center items-center">
        {renderGauge()}
      </div>
    </div>
  );
};
