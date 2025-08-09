import React from 'react';
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { EmailManagementView } from "@/components/admin/email/EmailManagementView";

const EmailManagementPage = () => {
  return (
    <AdminLayout>
      <EmailManagementView />
    </AdminLayout>
  );
};

export default EmailManagementPage;
