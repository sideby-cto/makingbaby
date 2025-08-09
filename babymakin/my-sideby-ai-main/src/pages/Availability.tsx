import React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';

const Availability = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Availability</h1>
        <p className="text-gray-600">Manage your availability settings here.</p>
      </div>
    </DashboardLayout>
  );
};

export default Availability;