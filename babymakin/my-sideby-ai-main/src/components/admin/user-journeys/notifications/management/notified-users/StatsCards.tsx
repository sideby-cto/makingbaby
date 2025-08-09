
import React from 'react';

interface StatsCardsProps {
  counts: {
    scheduled: number;
    sent: number;
    pending: number;
    failed: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ counts }) => {
  return (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-2 flex flex-col">
        <p className="text-xs text-blue-600 font-medium">Scheduled</p>
        <p className="text-lg font-bold">{counts.scheduled}</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-md p-2 flex flex-col">
        <p className="text-xs text-green-600 font-medium">Sent</p>
        <p className="text-lg font-bold">{counts.sent}</p>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-md p-2 flex flex-col">
        <p className="text-xs text-gray-600 font-medium">Pending</p>
        <p className="text-lg font-bold">{counts.pending}</p>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-md p-2 flex flex-col">
        <p className="text-xs text-red-600 font-medium">Failed</p>
        <p className="text-lg font-bold">{counts.failed}</p>
      </div>
    </div>
  );
};
