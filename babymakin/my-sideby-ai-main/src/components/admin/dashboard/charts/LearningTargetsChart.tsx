
import React from "react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TimePeriod, TimePeriodsData } from "@/utils/timePeriodsGenerator";

interface LearningTargetsChartProps {
  timePeriod: TimePeriod;
  timePeriodsData: Record<TimePeriod, TimePeriodsData[]>;
  onTimePeriodChange: (value: TimePeriod) => void;
}

const learningTargets = [
  {
    name: "Spaced Repetition Learning",
    reached: 60,
    color: "#22c55e"
  },
  {
    name: "Learning by Doing & Discussion",
    reached: 60,
    color: "#3b82f6"
  },
  {
    name: "Building GPTs",
    reached: 60,
    color: "#f59e0b"
  },
  {
    name: "AI Software Creation",
    reached: 15,
    color: "#8b5cf6"
  },
  {
    name: "Unobtrusive AI Assessment",
    reached: 30,
    color: "#ec4899"
  }
];

export const LearningTargetsChart = ({ 
  timePeriod, 
  timePeriodsData, 
  onTimePeriodChange 
}: LearningTargetsChartProps) => {
  // Transform learning targets into chart data
  const chartData = learningTargets.map(target => ({
    name: target.name,
    reached: target.reached,
  }));

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Learning Targets Introduced</h3>
          <p className="text-sm text-muted-foreground">Number of users reached per concept</p>
        </div>
        <ToggleGroup
          type="single"
          value={timePeriod}
          onValueChange={(value) => value && onTimePeriodChange(value as TimePeriod)}
          className="bg-muted/50 rounded-lg p-1"
        >
          <ToggleGroupItem value="daily" className="text-xs px-3">1D</ToggleGroupItem>
          <ToggleGroupItem value="weekly" className="text-xs px-3">1W</ToggleGroupItem>
          <ToggleGroupItem value="seasonal" className="text-xs px-3">Season</ToggleGroupItem>
          <ToggleGroupItem value="yearly" className="text-xs px-3">1Y</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ChartContainer 
        className="h-[300px]"
        config={{
          reached: {
            theme: {
              light: "#22c55e",
              dark: "#4ade80",
            },
          },
        }}
      >
        <AreaChart 
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 150, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false}
            tickLine={false}
            width={140}
            style={{
              fontSize: '12px'
            }}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="reached"
            stroke="#22c55e"
            fill="url(#colorReached)"
            name="Users Reached"
          />
          <defs>
            <linearGradient id="colorReached" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ChartContainer>
    </Card>
  );
};
