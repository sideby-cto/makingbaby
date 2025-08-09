
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { StageSettingsList } from "./StageSettingsList";
import { CreateStageDialog } from "./CreateStageDialog";
import { useJourneyStageSettings } from "./hooks/useJourneyStageSettings";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const JourneyStageSettings: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { stages, loading, refetch, error } = useJourneyStageSettings();
  const { isOnline, isSlowConnection } = useNetworkStatus();

  const handleStageUpdated = () => {
    refetch();
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Network Status Alert */}
      {(!isOnline || isSlowConnection || error) && (
        <Alert variant={!isOnline ? "destructive" : "default"}>
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <WifiOff className="h-4 w-4" />
            ) : isSlowConnection ? (
              <Wifi className="h-4 w-4 text-orange-500" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              {!isOnline 
                ? "No internet connection. Please check your network."
                : isSlowConnection
                ? "Slow connection detected. Operations may take longer."
                : error?.message?.includes('timeout')
                ? "Database timeout detected. This may be due to high server load."
                : error?.message
              }
              {error && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRetry}
                  className="ml-2"
                >
                  Retry
                </Button>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-semantic-text-primary">
            Journey Stage Settings
          </h2>
          <p className="text-sm text-semantic-text-secondary">
            Manage the stages of the user journey and their display settings
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={!isOnline}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Stage
        </Button>
      </div>

      <StageSettingsList 
        stages={stages}
        loading={loading}
        onStageUpdated={handleStageUpdated}
      />

      <CreateStageDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onStageCreated={handleStageUpdated}
      />
    </div>
  );
};
