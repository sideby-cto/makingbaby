import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface PacingData {
  time: string;
  selected: number;
  kept: number;
}

interface PacingChartProps {
  pacingData: PacingData[] | undefined;
  isPacingLoading: boolean;
}

export const PacingChart = ({ pacingData, isPacingLoading }: PacingChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Pace Selected vs Kept</h3>
      <ChartContainer
        className="h-[200px]"
        config={{
          selected: {
            theme: {
              light: "#2563eb",
              dark: "#60a5fa",
            },
          },
          kept: {
            theme: {
              light: "#dc2626",
              dark: "#f87171",
            },
          },
        }}
      >
        {isPacingLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading pacing data...</p>
          </div>
        ) : (
          <LineChart data={pacingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="natural"
              dataKey="selected"
              stroke="var(--color-selected)"
              dot={false}
            />
            <Line
              type="natural"
              dataKey="kept"
              stroke="var(--color-kept)"
              dot={false}
            />
          </LineChart>
        )}
      </ChartContainer>
    </Card>
  );
};