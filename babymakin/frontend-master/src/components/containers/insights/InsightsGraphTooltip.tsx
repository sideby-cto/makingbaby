export const InsightsGraphTooltip = ({ payload, active }: any) => {
  
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-4 flex flex-col items-center space-y-2 bg-[#000]/50 drop-shadow-md rounded-md">
        <p className="text-[12px] font-interMedium text-white">{`Week of ${payload[0].payload.tooltipLabel}`}</p>
        <span className="font-interBold text-sm text-white">
          <p className="text-[12px] font-interMedium text-white">{`Story Count: ${payload[0].payload.numStories}`}</p>
          <p className="text-[12px] font-interMedium text-white">{`Successes: ${payload[0].payload.numSuccesses}`}</p>
          <p className="text-[12px] font-interMedium text-white">{`Lessons Learned: ${payload[0].payload.numLessonsLearned}`}</p>
        </span>
      </div>
    );
  }

  return null;
};