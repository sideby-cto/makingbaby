


export const InsightsMinMaxTooltip = ({ payload, active }: any) => {

  if (active && payload && payload.length) {
    return (
      <div className="px-1 py-2 flex flex-col items-left  bg-[#000]/50 drop-shadow-md rounded-md">
        <p className="text-[11px] font-interMedium text-white">{`${payload[0].payload.name}`}</p>
        <span className="font-interBold text-sm text-white">
          <p className="text-[11px] font-interMedium text-white">{`Story Count: ${payload[0].payload.value}`}</p>
        </span>
      </div>
    );
  }

  return null;
};