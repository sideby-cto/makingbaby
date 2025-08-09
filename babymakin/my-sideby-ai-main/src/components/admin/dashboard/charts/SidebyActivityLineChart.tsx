
import React from 'react';
import { format, subDays, startOfDay, addDays, isWithinInterval } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface ActivityData {
  id: string;
  type: 'match_created' | 'match_completed' | 'member_joined';
  created_at: string;
  metadata?: {
    user_name?: string;
    partner_name?: string;
  };
}

interface ChartData {
  date: string;
  matchesCreated: number;
  matchesCompleted: number;
  membersJoined: number;
}

interface SidebyActivityLineChartProps {
  activities: ActivityData[];
}

export const SidebyActivityLineChart = ({ activities }: SidebyActivityLineChartProps) => {
  const chartData = React.useMemo(() => {
    if (!activities) return [];

    // Generate last 14 days
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return {
        date: format(date, 'MM/dd'),
        rawDate: startOfDay(date),
        matchesCreated: 0,
        matchesCompleted: 0,
        membersJoined: 0
      };
    });

    // Count activities by date and type
    activities.forEach(activity => {
      const activityDate = new Date(activity.created_at);
      
      // Find the day in our array that contains this activity date
      const dayIndex = days.findIndex(day => 
        isWithinInterval(activityDate, {
          start: day.rawDate,
          end: addDays(day.rawDate, 1)
        })
      );
      
      if (dayIndex !== -1) {
        if (activity.type === 'match_created') {
          days[dayIndex].matchesCreated++;
        } else if (activity.type === 'match_completed') {
          days[dayIndex].matchesCompleted++;
        } else if (activity.type === 'member_joined') {
          days[dayIndex].membersJoined++;
        }
      }
    });

    // Remove rawDate property before returning
    return days.map(({ rawDate, ...rest }) => rest);
  }, [activities]);

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Legend />
          <Line
            name="Matches Created"
            type="monotone"
            dataKey="matchesCreated"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: "#8884d8" }}
          />
          <Line
            name="Matches Completed"
            type="monotone"
            dataKey="matchesCompleted"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ fill: "#82ca9d" }}
          />
          <Line
            name="New Members"
            type="monotone"
            dataKey="membersJoined"
            stroke="#ffc658"
            strokeWidth={2}
            dot={{ fill: "#ffc658" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
