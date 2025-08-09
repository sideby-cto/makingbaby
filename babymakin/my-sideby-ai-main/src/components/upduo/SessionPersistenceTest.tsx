import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUpduoSession } from '@/hooks/useUpduoSession';
import { useUpduoSessionContext } from '@/contexts/UpduoSessionContext';
import { ExternalLink, Play, Square, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SessionPersistenceTest: React.FC = () => {
  const navigate = useNavigate();
  const {
    isSessionActive,
    isLoading,
    sessionMode,
    sessionType,
    error,
    startSession,
    endSession,
    openExternalSession
  } = useUpduoSession({
    defaultMode: 'dialog',
    defaultSessionType: 'reflection'
  });

  const { 
    sessionStartTime, 
    lastActiveTime, 
    updateLastActiveTime 
  } = useUpduoSessionContext();

  const logReflectionStart = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const userDisplayName = user.user_metadata?.first_name && user.user_metadata?.last_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
          : user.user_metadata?.first_name || user.email?.split('@')[0] || 'Unknown User';
        
        // Delete any existing reflection logs for this user first
        await supabase
          .from('user_reflections')
          .delete()
          .eq('user_id', user.id);
        
        // Insert new reflection log
        const { error } = await supabase
          .from('user_reflections')
          .insert({
            user_id: user.id,
            user_name: userDisplayName,
            reflection_start: new Date().toISOString()
          });

        if (error) {
          console.error('Failed to log reflection start:', error);
        } else {
          console.log('Reflection start logged successfully for:', userDisplayName);
        }
      }
    } catch (error) {
      console.error('Error logging reflection start:', error);
    }
  };

  const handleStartReflection = async () => {
    // Log reflection start
    await logReflectionStart();
    startSession('dialog', 'reflection');
  };

  const handleStartConversation = () => {
    startSession('fullscreen', 'conversation');
  };

  const handleStartPlanning = () => {
    startSession('embedded', 'planning');
  };

  const handleEndSession = () => {
    endSession();
  };

  const handleNavigateAway = () => {
    navigate('/dashboard');
  };

  const handleOpenInNewTab = () => {
    openExternalSession();
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Upduo Session Persistence Test</h1>
        <p className="text-muted-foreground">
          Test the persistent session management across navigation and tab switching
        </p>
      </div>

      {/* Session Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Session Status
            <Badge variant={isSessionActive ? 'default' : 'secondary'}>
              {isSessionActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Current session state and timing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Session Active:</span>
                <span className="text-sm">{isSessionActive ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Loading:</span>
                <span className="text-sm">{isLoading ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Mode:</span>
                <span className="text-sm">{sessionMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Type:</span>
                <span className="text-sm">{sessionType}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Started:</span>
                <span className="text-sm">{formatTime(sessionStartTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Active:</span>
                <span className="text-sm">{formatTime(lastActiveTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Error:</span>
                <span className="text-sm text-red-600">{error || 'None'}</span>
              </div>
            </div>
          </div>

          {isSessionActive && (
            <div className="pt-4 border-t">
              <Button
                onClick={updateLastActiveTime}
                variant="outline"
                size="sm"
                className="mr-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Update Activity
              </Button>
              <Button
                onClick={handleOpenInNewTab}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Session Controls</CardTitle>
          <CardDescription>
            Start different types of sessions to test persistence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleStartReflection}
              disabled={isLoading}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Reflection</span>
              <span className="text-xs opacity-75">(Dialog Mode)</span>
            </Button>
            <Button
              onClick={handleStartConversation}
              disabled={isLoading}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Conversation</span>
              <span className="text-xs opacity-75">(Fullscreen Mode)</span>
            </Button>
            <Button
              onClick={handleStartPlanning}
              disabled={isLoading}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Planning</span>
              <span className="text-xs opacity-75">(Embedded Mode)</span>
            </Button>
          </div>

          {isSessionActive && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={handleEndSession}
                variant="destructive"
                className="w-full"
              >
                <Square className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Test */}
      <Card>
        <CardHeader>
          <CardTitle>Persistence Test</CardTitle>
          <CardDescription>
            Test session persistence across navigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To test session persistence:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Start a session using one of the buttons above</li>
              <li>Navigate away from this page using the button below</li>
              <li>Come back to this page or any other page</li>
              <li>Check if the session is still active and the recovery indicator appears</li>
              <li>Try switching tabs or refreshing the page</li>
            </ol>
            <Button
              onClick={handleNavigateAway}
              variant="outline"
              className="w-full"
            >
              Navigate to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};