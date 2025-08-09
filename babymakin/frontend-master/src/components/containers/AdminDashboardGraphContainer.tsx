import React, { useCallback, useRef } from "react";
import { MdOutlineFilterNone } from "react-icons/md";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CustomTooltip, Loading } from "src/components";

interface Props {
  title: string;
  data: any[];
  loading?: boolean;
  fetchSubGraphs?: (args: any) => void;
  chartsContainerClassName?: string;
  graphKeysContainerClassName?: string;
}

export const AdminDashboardGraphContainer: React.FC<Props> = ({
  data,
  title,
  loading,
  chartsContainerClassName,
  fetchSubGraphs,
}) => {
  const graphLegendRef = useRef<HTMLDivElement>(null);

  const defaultCellStyle =
    "transition duration-400 ease-in-out hover:scale-[1.02] cursor-pointer";

  /**@RenderFn */
  const renderGraphKeys = useCallback(
    () =>
      data.map((item, idx) => (
        <div key={idx} className="flex w-full space-x-1">
          <div
            className={`flex-shrink-0 h-3 w-3 rounded-sm mt-[3px]`}
            style={{ backgroundColor: `${item.color}` }}
          />
          <span className="text-[12px] text-defaultText font-inter pt-0">
            {item.name}
          </span>
        </div>
      )),
    [data]
  );

  const renderDataCells = useCallback(
    () =>
      data.map((val, index) => (
        <Cell
          key={`cell-${index}`}
          fill={val.color}
          className={defaultCellStyle}
        />
      )),
    [data]
  );

  const renderGraph = () => {
    return loading ? (
      <div className="flex w-full h-20 flex justify-center items-center">
        <Loading />
      </div>
    ) : data && data.length > 0 ? (
      <div className="relative w-full flex flex-col-reverse lg-graph:flex-row">
        <div
          style={{
            backgroundColor: "transparent",
          }}
          className="w-full lg-graph:w-[100%] left-0 mt-[350px] lg-graph:mt-[350px] flex h-fit rounded-xl flex-col gap-y-2"
          ref={graphLegendRef}
        >
          {renderGraphKeys()}
        </div>
        <div className={chartsContainerClassName}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={140}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                onClick={fetchSubGraphs && fetchSubGraphs?.bind(this)}
              >
                {renderDataCells()}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
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
      <span className="block flex text-defaultText text-md font-interBold pb-3 border-[#000]/10 border-b-[1px]">
        {title}
      </span>
      <div className="flex w-full space-x-10 pt-3 min-h-[380px] justify-start">
        {renderGraph()}
      </div>
    </div>
  );
};
