import { MdOutlineFilterNone } from "react-icons/md";
import { StoryTellerColor } from "src/hooks/insights";
import {  Loading } from "src/components";


import { FaPencil } from "react-icons/fa6";
import { FaPenAlt } from "react-icons/fa";
import { HiPaintBrush } from "react-icons/hi2";
import { LiaMarkerSolid } from "react-icons/lia";
import { GiQuillInk } from "react-icons/gi";
import { GrCircleQuestion } from "react-icons/gr";


export const storyTellerBadge = (stLevel: Number ) => {
  if ( stLevel === 0 ) {
    return <FaPencil size={20} color={StoryTellerColor.scribe} />
  } else if ( stLevel === 1 ) {
    return <FaPenAlt size={21} color={StoryTellerColor.raconteur}/>
  } else if ( stLevel === 2 ) {
    return <HiPaintBrush size={23} color={StoryTellerColor.balladeer}/>
  } else if ( stLevel === 3 ) {
    return <LiaMarkerSolid size={24} color={StoryTellerColor.troubadour}/>
  } else if ( stLevel === 4 ) {
    return <GiQuillInk size={25} color={StoryTellerColor.bard}/>
  } else {
    return <GrCircleQuestion size={20} />
  }
};



interface Props {
  title: string;
  data: any[];
  loading?: boolean;
  leaderboardContainerClassName?: string;
}

export const InsightsLeaderboardContainer: React.FC<Props> = ({
  data,
  title,
  loading,
  leaderboardContainerClassName,
}) => {
   


  /**@RenderFn */
 
  
  const renderTable = () => {

    return loading ? (
      <div className="flex w-96 h-20 flex justify-center items-center text-lg">
        <Loading />
      </div>
    ) : data && data.length > 0 ? (

      <div className="w-full h-full text-lg" id="leaderboard-anchor-element-id">
        <table style={{width:"90%", height:"90%"}} align="center" >
          <thead style ={{border: 'none', color: '#202124', fontSize: '18px', width: 10}}>
            <tr>
              <th align="center">Rank</th>
              <th align="center">Name</th>
              <th align="center">Stories</th>
              <th align="center">Level</th>
            </tr>
          </thead>
          <tbody  style ={{border: 'none', color: '#202124', fontSize: '16px', fontWeight: 500}}>
            {data.map((element) => (
              <tr>
                <td align="center" style={{padding: "6px"}}>{element.ranking}</td>
                <td align="center" style={{padding: "6px"}}>{element.fullName}</td>
                <td align="center" style={{padding: "6px"}}>{element.numStories}</td>
                <td align="center" style={{padding: "6px"}} >
                  <div className="group relative w-max">
                    {storyTellerBadge(element.level)}
                    <span
                      className="pointer-events-none absolute -top-7 right-2 w-max opacity-0 transition-opacity group-hover:opacity-100 px-3 py-4 flex flex-col items-center space-y-2 bg-[#000]/50 drop-shadow-md rounded-md text-[12px] font-interMedium text-white"
                    >
                      {element.tooltipLabel}
                    </span>
                  </div>
                </td>
              </tr> 
            ))}
         </tbody>
        </table>
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
      <div className="flex w-full space-x-30 pt-3 min-h-[250px] justify-start">
        {renderTable()}
      </div>
    </div>

  );
};
