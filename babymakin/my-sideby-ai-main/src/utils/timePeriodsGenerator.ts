
import { format, subWeeks } from "date-fns";

export interface TimePeriodsData {
  date: string;
  targets: number;
}

export type TimePeriod = "daily" | "weekly" | "seasonal" | "yearly";

export const generateTimePeriodsData = (): Record<TimePeriod, TimePeriodsData[]> => {
  return {
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: format(subWeeks(new Date(), i), 'MM/dd'),
      targets: Math.floor(Math.random() * 10) + 1
    })),
    weekly: Array.from({ length: 4 }, (_, i) => ({
      date: format(subWeeks(new Date(), i), 'MM/dd'),
      targets: Math.floor(Math.random() * 20) + 5
    })),
    seasonal: Array.from({ length: 3 }, (_, i) => ({
      date: format(subWeeks(new Date(), i * 4), 'MM/dd'),
      targets: Math.floor(Math.random() * 50) + 10
    })),
    yearly: Array.from({ length: 12 }, (_, i) => ({
      date: format(subWeeks(new Date(), i * 4), 'MM/yyyy'),
      targets: Math.floor(Math.random() * 100) + 20
    }))
  };
};
