import React from "react";
import { MdOutlineFilterNone } from "react-icons/md";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InsightsGraphTooltip, Loading } from "src/components";

interface Props {
  title: string;
  data: any[];
  loading?: boolean;
  chartsContainerClassName?: string;
}

export const InsightsGraphContainer: React.FC<Props> = ({
  data,
  title,
  loading,
  chartsContainerClassName,
}) => {


  /**@RenderFn */

  const renderColorfulLegend = ( value: string, entry: any ) => {
    const color  = "#34383D";
    let label = " ";
    if ( value === "numSuccesses") {
      label = "Successes";
    } else {
      label = "Lessons Learned";
    }
    return <span style={{color}}>{label}</span>
  }

  const renderGraph = () => {
    return loading ? (
      <div className="flex w-full h-20 flex justify-center items-center">
        <Loading />
      </div>
    ) : data && data.length > 0 ? (
      <div className="relative w-full flex flex-col">
         <div className={chartsContainerClassName}>
          <ResponsiveContainer>
            <BarChart
              width = {200}
              height = {200}
              data = {data}
              margin={{
                top: 5,
                right: 2,
                left: 0,
                bottom: 5,
              }}
              barSize={30}
            >
              <XAxis dataKey="label" interval={"equidistantPreserveStart"} />
              <YAxis />
              <Tooltip content={<InsightsGraphTooltip />} />
              <Bar 
                dataKey="numSuccesses" 
                stackId = "a"
                fill="#678293" 
              />
              <Bar 
                dataKey="numLessonsLearned" 
                stackId = "a"
                fill="#DCB13C" 
              />
              <Legend
                verticalAlign="bottom"
                formatter={renderColorfulLegend}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
      <div className="flex w-full space-x-10 pt-3 min-h-[380px] justify-start">
        {renderGraph()}
      </div>
    </div>
  );
};
