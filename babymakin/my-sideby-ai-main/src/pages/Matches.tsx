import React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { ActivityScoreCard } from '@/components/activity/ActivityScoreCard';
import { ActivityMatchesList } from '@/components/activity/ActivityMatchesList';

const Matches = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Activity-Based Matching</h1>
          <p className="text-muted-foreground">
            Connect with educators who have similar activity levels and engagement patterns.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ActivityScoreCard />
          </div>
          <div className="lg:col-span-2">
            <ActivityMatchesList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Matches;