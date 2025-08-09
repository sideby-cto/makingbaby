
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { useUpduoTranscriptTimeSeries } from "@/hooks/useUpduoTranscripts";
import { ChartSkeleton } from "./ChartSkeleton";

interface LearningTimelineCardProps {
  userId?: string;
}

export const LearningTimelineCard = ({ userId }: LearningTimelineCardProps) => {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  const { 
    data: timeSeriesData, 
    isLoading,
    error
  } = useUpduoTranscriptTimeSeries(userId, timeFrame);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="font-semibold text-lg">Learning Timeline</CardTitle>
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as any)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : error ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Error loading timeline data
          </div>
        ) : timeSeriesData && timeSeriesData.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="session_count"
                  name="Sessions"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="word_count"
                  name="Words (x100)"
                  stroke="#82ca9d"
                  dot={{ strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total_duration"
                  name="Duration (min)"
                  stroke="#ffc658"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            No learning data available for this timeframe
          </div>
        )}
      </CardContent>
    </Card>
  );
};
