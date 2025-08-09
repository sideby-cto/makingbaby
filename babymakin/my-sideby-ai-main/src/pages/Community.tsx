import React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';

const Community = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Community</h1>
        <p className="text-gray-600">Connect with other educators in the community.</p>
      </div>
    </DashboardLayout>
  );
};

export default Community;