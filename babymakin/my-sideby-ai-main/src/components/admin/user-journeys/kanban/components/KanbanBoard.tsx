
import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { UserJourney } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { UserCard } from './UserCard';
import { useJourneyStages } from '../hooks/useJourneyStages';
import { useStageUpdate } from '../hooks/useStageUpdate';
import { toast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  journeys: UserJourney[];
  onJourneyUpdate: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  journeys, 
  onJourneyUpdate 
}) => {
  const [activeUser, setActiveUser] = useState<UserJourney | null>(null);
  const [optimisticJourneys, setOptimisticJourneys] = useState<UserJourney[]>(journeys);
  
  const { stages, loading: stagesLoading, error: stagesError } = useJourneyStages();
  const { updateUserStage, updating } = useStageUpdate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Update optimistic journeys when props change
  React.useEffect(() => {
    setOptimisticJourneys(journeys);
  }, [journeys]);

  // Group journeys by stage
  const journeysByStage = useMemo(() => {
    const grouped: Record<string, UserJourney[]> = {};
    
    // Initialize all stages with empty arrays
    stages.forEach(stageConfig => {
      grouped[stageConfig.stage] = [];
    });
    
    // Group journeys by their current stage
    optimisticJourneys.forEach(journey => {
      const stage = journey.stage || 'new';
      if (!grouped[stage]) {
        grouped[stage] = [];
      }
      grouped[stage].push(journey);
    });
    
    return grouped;
  }, [optimisticJourneys, stages]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const user = active.data.current?.user;
    setActiveUser(user);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveUser(null);

    if (!over || active.id === over.id) {
      return;
    }

    const user = active.data.current?.user as UserJourney;
    const newStage = over.id as string;
    const previousStage = user.stage;

    if (previousStage === newStage) {
      return;
    }

    // Validate that the new stage is valid against our loaded stages
    const validStage = stages.find(s => s.stage === newStage);
    if (!validStage) {
      console.error(`Invalid stage: ${newStage}. Valid stages:`, stages.map(s => s.stage));
      toast({
        title: "Invalid Stage",
        description: `Cannot move user to stage "${newStage}". This stage is not configured in the system.`,
        variant: "destructive",
      });
      return;
    }

    // Also validate the previous stage
    const validPreviousStage = stages.find(s => s.stage === previousStage);
    if (!validPreviousStage) {
      console.error(`Invalid previous stage: ${previousStage}. Valid stages:`, stages.map(s => s.stage));
      toast({
        title: "Invalid Previous Stage",
        description: `User's current stage "${previousStage}" is not recognized. Please refresh the page and try again.`,
        variant: "destructive",
      });
      return;
    }

    console.log(`Moving user ${user.id} from ${previousStage} to ${newStage}`);

    // Optimistic update
    setOptimisticJourneys(prev => 
      prev.map(journey => 
        journey.id === user.id 
          ? { ...journey, stage: newStage }
          : journey
      )
    );

    // Try to update via API
    const success = await updateUserStage(user.id, previousStage, newStage);

    if (success) {
      // Refresh data from parent
      onJourneyUpdate();
      toast({
        title: "Stage Updated",
        description: `${user.first_name || user.firstName || 'User'} moved to ${validStage.label}`,
      });
    } else {
      // Revert optimistic update on failure
      setOptimisticJourneys(prev => 
        prev.map(journey => 
          journey.id === user.id 
            ? { ...journey, stage: previousStage }
            : journey
        )
      );
      toast({
        title: "Update Failed",
        description: `Failed to move user to ${validStage.label}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (stagesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading stages...</p>
        </div>
      </div>
    );
  }

  if (stagesError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">Error loading journey stages</div>
          <p className="text-sm text-gray-600">Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-4">
          <div className="text-yellow-500 mb-2">No journey stages configured</div>
          <p className="text-sm text-gray-600">Please configure journey stages in the settings.</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-x-auto">
        <div className="flex gap-6 h-full min-w-max p-4">
          {stages.map((stageConfig) => (
            <div key={stageConfig.stage} className="flex-shrink-0 w-80">
              <KanbanColumn
                stage={stageConfig}
                users={journeysByStage[stageConfig.stage] || []}
                updatingUserId={updating}
              />
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeUser ? (
          <div className="rotate-6 scale-105">
            <UserCard user={activeUser} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
