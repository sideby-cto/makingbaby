
import React from 'react';
import { format } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, TooltipProps } from "recharts";
import type { UpduoTranscript } from "@/types/upduo";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface ChartData {
  date: string;
  count: number;
  duration: number;
  wordCount: number;
}

interface UpduoActivityLineChartProps {
  transcripts: UpduoTranscript[];
}

export const UpduoActivityLineChart = ({ transcripts }: UpduoActivityLineChartProps) => {
  const chartData = React.useMemo(() => {
    if (!transcripts || transcripts.length === 0) {
      // Return placeholder data if no transcripts
      return [
        { date: format(new Date(), 'MM/dd'), count: 0, duration: 0, wordCount: 0 }
      ];
    }

    const dateMap = new Map<string, ChartData>();

    transcripts.forEach(transcript => {
      const date = format(new Date(transcript.created_at), 'MM/dd');
      const metadata = transcript.metadata || {};
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          count: 0,
          duration: 0,
          wordCount: 0
        });
      }
      
      const entry = dateMap.get(date)!;
      entry.count += 1;
      entry.duration += metadata.duration || 0;
      entry.wordCount += metadata.word_count || 0;
    });

    const data = Array.from(dateMap.values());

    data.sort((a, b) => {
      const [aMonth, aDay] = a.date.split('/').map(Number);
      const [bMonth, bDay] = b.date.split('/').map(Number);
      if (aMonth !== bMonth) return aMonth - bMonth;
      return aDay - bDay;
    });

    return data;
  }, [transcripts]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const sessionCount = payload[0].value;
      const duration = payload[1]?.value as number;
      const wordCount = payload[2]?.value as number;
      
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-bold">{label}</p>
          <p className="text-sm">{`Sessions: ${sessionCount}`}</p>
          {duration > 0 && (
            <p className="text-sm">{`Duration: ${Math.round(duration / 60)} min`}</p>
          )}
          {wordCount > 0 && (
            <p className="text-sm">{`Words: ${wordCount}`}</p>
          )}
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="h-[200px] w-full">
      {/* Empty state when no data */}
      {(!transcripts || transcripts.length === 0) ? (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-muted-foreground">No upduo activity data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="count" 
              name="Sessions"
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: "#8884d8" }}
            />
            <Line 
              type="monotone" 
              dataKey="duration" 
              name="Duration"
              stroke="#82ca9d" 
              strokeWidth={2}
              dot={{ fill: "#82ca9d" }}
              hide={chartData.every(d => !d.duration)}
            />
            <Line 
              type="monotone" 
              dataKey="wordCount" 
              name="Words"
              stroke="#ffc658" 
              strokeWidth={2}
              dot={{ fill: "#ffc658" }}
              hide={chartData.every(d => !d.wordCount)}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
