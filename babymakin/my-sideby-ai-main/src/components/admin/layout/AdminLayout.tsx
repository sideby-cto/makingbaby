
import React, { useState, useEffect } from "react";
import { AdminNavbar } from "./AdminNavbar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminAddIdeaDialog } from "../dashboard/components/AdminAddIdeaDialog";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ImpersonationBanner } from "@/components/dashboard/layout/ImpersonationBanner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  console.log("AdminLayout component is rendering");
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addIdeaDialogOpen, setAddIdeaDialogOpen] = useState(false);
  const { supabaseUser } = useAuth();

  useEffect(() => {
    console.log("AdminLayout mounted successfully");
    console.log("supabaseUser:", supabaseUser);
  }, [supabaseUser]);

  const { profile, viewingAsUserId, originalUser } = useProfile();
  const isImpersonating = !!viewingAsUserId && !!originalUser;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Always visible on desktop */}
      <AdminSidebar 
        open={sidebarOpen} 
        onOpenChange={setSidebarOpen}
        onAddIdea={() => setAddIdeaDialogOpen(true)}
      />
      
      {/* Main content area */}
      <div className="flex-1 lg:ml-0 min-w-0">
        <AdminNavbar 
          onMenuClick={() => setSidebarOpen(true)}
          onAddIdea={() => setAddIdeaDialogOpen(true)}
        />
        {isImpersonating && (
          <ImpersonationBanner 
            originalUser={originalUser}
            impersonatedUserId={viewingAsUserId}
            impersonatedUserEmail={profile?.email}
          />
        )}
        
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Add Idea Dialog */}
      {supabaseUser && (
        <AdminAddIdeaDialog
          open={addIdeaDialogOpen}
          onOpenChange={setAddIdeaDialogOpen}
          userId={supabaseUser.id}
        />
      )}
    </div>
  );
};

export default AdminLayout;
