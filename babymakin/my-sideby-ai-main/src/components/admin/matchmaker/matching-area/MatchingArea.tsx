import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MatchingAreaContent } from "./MatchingAreaContent";
import { useMatchHandler } from "@/hooks/useMatchHandler";
import { Profile } from "../types/matchmaking";
import { MatchConfirmationDialog } from "../components/MatchConfirmationDialog";

interface MatchingAreaProps {
  onMatch?: () => void;
}

export const MatchingArea: React.FC<MatchingAreaProps> = ({ onMatch }) => {
  const { selectedUsers, setSelectedUsers, handleMatch, isCreating } = useMatchHandler({ onMatchCreated: onMatch });
  const [matchDescription, setMatchDescription] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Function to handle user removal from the drop area
  const handleRemoveUser = (userId: string) => {
    if (!selectedUsers) return;
    
    if (selectedUsers[0]?.id === userId) {
      setSelectedUsers([selectedUsers[1] as Profile, null]);
    } else if (selectedUsers[1]?.id === userId) {
      setSelectedUsers([selectedUsers[0], null]);
    }
  };
  
  // Function to handle match description changes
  const handleMatchDescriptionChange = (description: string) => {
    setMatchDescription(description);
  };
  
  // Function to handle match creation
  const onCreateMatch = () => {
    if (!selectedUsers || !selectedUsers[0] || !selectedUsers[1]) {
      console.log("Cannot create match: missing users", selectedUsers);
      return;
    }
    
    setShowConfirmDialog(true);
  };

  // Function to confirm match creation
  const confirmMatch = async (rationale: string) => {
    if (!selectedUsers || !selectedUsers[0] || !selectedUsers[1]) {
      return;
    }
    
    await handleMatch(selectedUsers[0], selectedUsers[1], rationale);
    
    // Reset state after match creation
    setShowConfirmDialog(false);
    setMatchDescription("");
  };

  // Function to handle when a user is dropped
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    try {
      // Attempt to extract the profile data from the drag event
      let profileData;
      if (e.dataTransfer.types.includes('profile')) {
        profileData = e.dataTransfer.getData('profile');
      } else if (e.dataTransfer.types.includes('application/json')) {
        profileData = e.dataTransfer.getData('application/json');
      } else {
        profileData = e.dataTransfer.getData('text/plain');
      }
      
      if (!profileData) {
        console.error("No profile data found in drag event");
        return;
      }
      
      // Parse the profile data
      const profile: Profile = JSON.parse(profileData);
      console.log("Dropped profile:", profile);
      
      // Add the user to the selectedUsers
      if (!selectedUsers) {
        setSelectedUsers([profile, null]);
      } else if (selectedUsers[0] && !selectedUsers[1]) {
        // Don't allow dropping the same user twice
        if (selectedUsers[0].id === profile.id) {
          console.log("User already added");
          return;
        }
        setSelectedUsers([selectedUsers[0], profile]);
      } else if (!selectedUsers[0] && selectedUsers[1]) {
        // Don't allow dropping the same user twice
        if (selectedUsers[1].id === profile.id) {
          console.log("User already added");
          return;
        }
        setSelectedUsers([profile, selectedUsers[1]]);
      } else {
        // If both slots are filled, replace the first one
        setSelectedUsers([profile, selectedUsers[1]]);
      }
    } catch (error) {
      console.error("Error processing dropped user:", error);
    }
  };

  // Drag over handler for visual feedback
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  // Drag leave handler to reset visual feedback
  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  return (
    <>
      <Card className={`border-2 ${isDragActive ? 'border-primary border-dashed bg-primary/5' : 'border-transparent'}`}>
        <CardContent 
          className="p-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <MatchingAreaContent 
            droppedUsers={selectedUsers ? 
              [...(selectedUsers[0] ? [selectedUsers[0]] : []), 
               ...(selectedUsers[1] ? [selectedUsers[1]] : [])] 
              : []}
            onRemoveUser={handleRemoveUser}
            matchDescription={matchDescription}
            onMatchDescriptionChange={handleMatchDescriptionChange}
            onMatch={onCreateMatch}
            isDragActive={isDragActive}
          />
        </CardContent>
      </Card>

      {selectedUsers && selectedUsers[0] && selectedUsers[1] && (
        <MatchConfirmationDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          user1={selectedUsers[0]}
          user2={selectedUsers[1]}
          onConfirm={confirmMatch}
          isCreating={isCreating}
          defaultRationale={matchDescription}
          matchType="manual"
        />
      )}
    </>
  );
};
