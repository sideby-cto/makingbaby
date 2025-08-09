
import React from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";

const AdminUsers = () => {
  console.log("AdminUsers component is rendering");
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-8 space-y-6 bg-gray-50">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-lg text-gray-600">
            Manage and monitor all users on the sideby platform
          </p>
        </div>

        <div className="grid gap-6">
          {/* Placeholder content for user management */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Users Overview</h2>
            <p className="text-gray-600">
              User management functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
