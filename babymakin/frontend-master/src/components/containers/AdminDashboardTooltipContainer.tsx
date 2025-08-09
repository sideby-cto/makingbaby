export const CustomTooltip = ({ payload, active }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-4 flex flex-col items-center space-y-2 bg-[#000]/50 drop-shadow-md rounded-md">
        <p className="text-[12px] font-interMedium text-white">{`${payload[0].payload.payload.name}`}</p>
        <span className="font-interBold text-sm text-white">
          {payload[0].payload.payload.value}
        </span>
      </div>
    );
  }

  return null;
};