import React from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { UserJourneysView } from "@/components/admin/user-journeys/UserJourneysView";

const AdminUserJourneys = () => {
  return (
    <AdminLayout>
      <div className="container py-8 space-y-8 max-w-[1400px] mx-auto bg-semantic-background">
        <div className="flex flex-col space-y-2">
          <h1 className="text-display-sm text-semantic-text-primary font-sans tracking-tight">User Journeys</h1>
          <p className="text-body-lg text-semantic-text-secondary">
            Track and analyze how users interact with the sideby platform
          </p>
        </div>
        <UserJourneysView />
      </div>
    </AdminLayout>
  );
};

export default AdminUserJourneys;
