import React from 'react';
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { NotificationManagement } from "@/components/admin/NotificationManagement";

const NotificationManagementPage = () => {
  return (
    <AdminLayout>
      <div className="container py-8 max-w-[1400px] mx-auto bg-semantic-background">
        <h1 className="text-display-sm text-semantic-text-primary font-sans mb-6">Notification Management</h1>
        <NotificationManagement />
      </div>
    </AdminLayout>
  );
};

export default NotificationManagementPage;
