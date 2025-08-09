import React from "react";
import { MdOutlineFilterNone } from "react-icons/md";
import { BarChart, Bar,  XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { InsightsMinMaxTooltip, Loading } from "src/components";
import { IndicatorSet } from "src/hooks/insights";
import { COLOR } from "src/design-system";




interface MinMaxProps {
  maxSubtitle: string,
  minSubtitle: string,
  data: IndicatorSet;
  showMinGraphs: boolean;
  isLessonsLearned: boolean;
  loading?: boolean;
  minMaxContainerClassName?: string;
}

export const InsightsMinMaxContainer: React.FC<MinMaxProps> = ({
  maxSubtitle,
  minSubtitle,
  data,
  showMinGraphs,
  isLessonsLearned,
  loading,
  minMaxContainerClassName,
}) => {
  
  const kLabelColor = COLOR.navyBlue;

  const kMinSubtitleClassName = showMinGraphs ? "ps-4 block flex text-nowrap text-ellipsis  text-md font-interBold pb-5" : "invisible";
  const kMinBarChartClassName = showMinGraphs ? "flex w-full pt-1 min-h-[300px] text-sm justify-left" : "invisible";

  const kMaxSubtitleClassName = "ps-4 block flex text-nowrap text-ellipsis text-md font-interBold pb-5";
  const kMaxBarChartClassName = "w-full  min-h-[300px] text-sm justify-left";

  const dataMaxSet = isLessonsLearned ?  data.lessonsLearned.maxSet :  data.smallWins.maxSet;
  const dataMinSet = isLessonsLearned ?  data.lessonsLearned.minSet :  data.smallWins.minSet;


  const renderCustomizedLabel = (data: any ) => {
    const value = data["name"];

    const x = data["x"] + data["offset"];
    const y = data["y"] + 28;
  
    return (
      <g>
        <text x={x} y={y} width={100} fill={kLabelColor} fontSize={14} textAnchor="center" dominantBaseline="bottom">
          {value}
        </text>
      </g>
    );
  };

  const noDataToRender = ( renderData: any ) => {
    return ( renderData === undefined  || renderData.length === 0 );
  }

  // could use this boolean to hide the X Axis on the max graphs when both max and min graphs are present.
  // for now, we always display the X Axis for all graphs.  It looks better when there is sparse data that way.
  // const hideXAxisForMaxGraph = showMinGraphs && !noDataToRender( dataMinSet );

  const renderHorizontalBarChart = (renderData: any, hideXAxis: boolean ) => {

    return loading ? (
      <div className="flex w-full h-20 flex justify-center items-center">
        <Loading />
      </div>
    ) : data && data.combined.xAxisLength > 0 ? (
      (noDataToRender(renderData)) ? (
        <div
        className={`flex flex-col space-y-5 w-full h-fit py-10 items-center justify-center`}
        >
          <MdOutlineFilterNone color="#000" size="32px" />
          <h2 className="text-md font-inter"> No data</h2>
        </div>
      ) : (
        <div className="relative w-full flex">
          <div className={minMaxContainerClassName}>   
            <ResponsiveContainer width="100%" height="65%">
              <BarChart
                data = {renderData}
                layout = 'vertical'
                margin={{
                  top: 0,
                  right: 2,
                  left: 8,
                  bottom: 5,
                }}
                barSize={10}
              >          
                <XAxis 
                  hide={hideXAxis}
                  tick={true}
                  type = "number"
                  domain = {[0,data.combined.xAxisLength]}
                />
                <YAxis 
                  type = "category"
                  tick={false}
                  width={8}
                />
                <Tooltip 
                  offset={0}
                  wrapperStyle={{ outline: "none" }}
                  viewBox={{x:0, y:0, width: 40, height: 100}}
                  allowEscapeViewBox={{x:false,y:false}}
                  content={<InsightsMinMaxTooltip />} 
                />
                <Bar 
                  dataKey="value" 
                  background={{ fill: '#fff' }}
                >
                  <LabelList dataKey="name" content={renderCustomizedLabel} position="centerBottom"/>
                </Bar> 
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> 
      )
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
        "flex-1 flex-col space-y-3 p-3 bg-white"
      }
    >
 
      <span className={kMaxSubtitleClassName}>
        {maxSubtitle}
      </span>

      <div className={kMaxBarChartClassName}>
        {renderHorizontalBarChart( dataMaxSet, false )}
      </div>


      <span className={kMinSubtitleClassName}>
        {minSubtitle}
      </span>

      <div className={kMinBarChartClassName}>
        {renderHorizontalBarChart( dataMinSet, false )}
      </div>

   </div>
  );
};
