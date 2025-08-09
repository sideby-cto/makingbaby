import React from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { CrewsList } from "./components/CrewsList";
import { AddCrewDialog } from "./components/AddCrewDialog";
import { EditCrewDialog } from "./components/EditCrewDialog";
import { CrewMembersView } from "./components/CrewMembersView";
import { useCrews } from "./hooks/useCrews";

const CrewsAdminPage = () => {
  const {
    crews,
    loading,
    selectedCrew,
    setSelectedCrew,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleCreateCrew,
    handleUpdateCrew,
    handleEditCrew,
    handleViewMembers,
    handleBackToCrews
  } = useCrews();

  return (
    <AdminLayout>
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crews Management</h1>
            <p className="text-muted-foreground">
              Create and manage crews for your community
            </p>
          </div>
          
          <AddCrewDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onCreateCrew={handleCreateCrew}
          />
        </div>
        
        {/* Crew List or Selected Crew Members */}
        {selectedCrew ? (
          <CrewMembersView 
            crew={selectedCrew} 
            onBack={handleBackToCrews}
            onUpdate={handleUpdateCrew}
          />
        ) : (
          <CrewsList
            crews={crews}
            loading={loading}
            onEdit={handleEditCrew}
            onViewMembers={handleViewMembers}
          />
        )}
        
        {/* Edit Crew Dialog */}
        <EditCrewDialog 
          crew={selectedCrew}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleUpdateCrew}
          onCrewChange={setSelectedCrew}
        />
      </div>
    </AdminLayout>
  );
};

export default CrewsAdminPage;
