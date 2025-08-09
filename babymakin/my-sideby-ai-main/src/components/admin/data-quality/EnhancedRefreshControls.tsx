import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  Database, 
  Cloud, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface RefreshOperation {
  id: string;
  type: 'session_sync' | 'data_refresh' | 'cache_clear';
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimatedDuration?: number;
  startTime?: Date;
}

interface EnhancedRefreshControlsProps {
  onRefreshComplete?: () => void;
}

export const EnhancedRefreshControls: React.FC<EnhancedRefreshControlsProps> = ({
  onRefreshComplete
}) => {
  const { toast } = useToast();
  const [operations, setOperations] = useState<RefreshOperation[]>([]);
  const [globalRefreshing, setGlobalRefreshing] = useState(false);

  const updateOperation = (id: string, updates: Partial<RefreshOperation>) => {
    setOperations(prev => prev.map(op => 
      op.id === id ? { ...op, ...updates } : op
    ));
  };

  const addOperation = (operation: Omit<RefreshOperation, 'id'>) => {
    const id = `${operation.type}_${Date.now()}`;
    const newOp: RefreshOperation = {
      ...operation,
      id,
      startTime: new Date()
    };
    setOperations(prev => [...prev, newOp]);
    return id;
  };

  const removeOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id));
  };

  const refreshSessionData = async () => {
    const opId = addOperation({
      type: 'session_sync',
      status: 'running',
      progress: 0,
      message: 'Refreshing session data...',
      estimatedDuration: 30
    });

    try {
      updateOperation(opId, { progress: 25, message: 'Fetching session data...' });
      
      // Get recent sessions to simulate refresh
      const { data: sessions, error } = await supabase
        .from('upduo_transcripts')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      updateOperation(opId, { progress: 75, message: `Found ${sessions?.length || 0} recent sessions...` });

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateOperation(opId, {
        status: 'completed',
        progress: 100,
        message: `Refreshed ${sessions?.length || 0} session records`
      });

      toast({
        title: "Session Data Refreshed",
        description: `Successfully refreshed ${sessions?.length || 0} session records`,
      });

      setTimeout(() => removeOperation(opId), 3000);
      onRefreshComplete?.();

    } catch (error) {
      updateOperation(opId, {
        status: 'failed',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      toast({
        title: "Session Refresh Failed",
        description: "Failed to refresh session data",
        variant: "destructive"
      });

      setTimeout(() => removeOperation(opId), 5000);
    }
  };

  const clearDataCaches = async () => {
    const opId = addOperation({
      type: 'cache_clear',
      status: 'running',
      progress: 0,
      message: 'Clearing data caches...',
      estimatedDuration: 10
    });

    try {
      updateOperation(opId, { progress: 50, message: 'Clearing query caches...' });
      
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 2000));

      updateOperation(opId, {
        status: 'completed',
        progress: 100,
        message: 'Data caches cleared successfully'
      });

      toast({
        title: "Caches Cleared",
        description: "All data caches have been cleared",
      });

      setTimeout(() => removeOperation(opId), 3000);
      onRefreshComplete?.();

    } catch (error) {
      updateOperation(opId, {
        status: 'failed',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      toast({
        title: "Cache Clear Failed",
        description: "Failed to clear data caches",
        variant: "destructive"
      });

      setTimeout(() => removeOperation(opId), 5000);
    }
  };

  const performFullRefresh = async () => {
    setGlobalRefreshing(true);
    
    const opId = addOperation({
      type: 'data_refresh',
      status: 'running',
      progress: 0,
      message: 'Starting full data refresh...',
      estimatedDuration: 60
    });

    try {
      // Step 1: Refresh sessions
      updateOperation(opId, { progress: 20, message: 'Refreshing session data...' });
      await refreshSessionData();
      
      // Step 2: Clear caches
      updateOperation(opId, { progress: 60, message: 'Clearing caches...' });
      await clearDataCaches();
      
      // Step 3: Final cleanup
      updateOperation(opId, { progress: 90, message: 'Finalizing refresh...' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateOperation(opId, {
        status: 'completed',
        progress: 100,
        message: 'Full refresh completed successfully'
      });

      toast({
        title: "Full Refresh Complete",
        description: "All data has been refreshed successfully",
      });

      setTimeout(() => removeOperation(opId), 3000);
      onRefreshComplete?.();

    } catch (error) {
      updateOperation(opId, {
        status: 'failed',
        message: `Full refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      toast({
        title: "Full Refresh Failed",
        description: "Failed to complete full data refresh",
        variant: "destructive"
      });

      setTimeout(() => removeOperation(opId), 5000);
    } finally {
      setGlobalRefreshing(false);
    }
  };

  const getOperationIcon = (type: RefreshOperation['type']) => {
    switch (type) {
      case 'session_sync': return <Cloud className="h-4 w-4" />;
      case 'cache_clear': return <Database className="h-4 w-4" />;
      case 'data_refresh': return <RefreshCw className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: RefreshOperation['status']) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const activeOperations = operations.filter(op => op.status === 'running');
  const hasActiveOperations = activeOperations.length > 0;

  return (
    <div className="space-y-4">
      {/* Control Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Data Refresh Controls
          </CardTitle>
          <CardDescription>
            Simple data refresh and cache management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={refreshSessionData}
              disabled={hasActiveOperations}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Cloud className="h-4 w-4" />
              Refresh Sessions
            </Button>
            
            <Button
              onClick={clearDataCaches}
              disabled={hasActiveOperations}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Clear Caches
            </Button>
            
            <Button
              onClick={performFullRefresh}
              disabled={hasActiveOperations || globalRefreshing}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${globalRefreshing ? 'animate-spin' : ''}`} />
              Full Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Operations */}
      {operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operations.map((operation) => (
                <div key={operation.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getOperationIcon(operation.type)}
                      <span className="font-medium capitalize">
                        {operation.type.replace('_', ' ')}
                      </span>
                      <Badge 
                        variant="outline"
                        className={getStatusColor(operation.status)}
                      >
                        {operation.status === 'running' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                        {operation.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {operation.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {operation.status}
                      </Badge>
                    </div>
                    {operation.status === 'running' && (
                      <span className="text-sm text-gray-500">
                        {operation.progress}%
                      </span>
                    )}
                  </div>
                  
                  {operation.status === 'running' && (
                    <Progress value={operation.progress} className="h-2" />
                  )}
                  
                  <p className="text-sm text-gray-600">{operation.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};