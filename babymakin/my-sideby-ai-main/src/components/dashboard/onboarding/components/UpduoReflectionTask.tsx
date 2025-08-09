
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompletionDateAlert } from './CompletionDateAlert';
import { ReflectionCompletedAlert } from './ReflectionCompletedAlert';
import { TaskExplanationAlert } from './TaskExplanationAlert';
import { PartialReflectionAlert } from './PartialReflectionAlert';
import { TaskCardFooter } from './TaskCardFooter';
import { UpduoIframeDialog } from '@/components/upduo/UpduoIframeDialog';
import { UpduoPreparationDialog } from './UpduoPreparationDialog';
import { Loader } from 'lucide-react';

interface UpduoReflectionTaskProps {
  hasCompletedReflection: boolean;
  hasActiveMatch?: boolean;
  videoOpen: boolean;
  videoFinished: boolean;
  suggestedCompletion: {
    date: string;
    pacingLabel: string;
    days: number;
  };
  profileData?: {
    approved_flow_activity?: string;
  };
  sessionData?: {
    upduo_session_id?: string;
    upduo_session_name?: string;
    participants?: number;
    duration?: string;
    scheduled_time?: string;
  };
  onWatchVideo: () => void;
  onVideoEnded: () => void;
  onCloseVideo: () => void;
  onGoToToolbox: () => void;
  onHelp: () => void;
  onShowCaughtUpMessage: () => void;
  onGoToChat?: () => void;
}

export const UpduoReflectionTask: React.FC<UpduoReflectionTaskProps> = ({
  hasCompletedReflection,
  hasActiveMatch,
  videoOpen,
  videoFinished,
  suggestedCompletion,
  profileData,
  sessionData,
  onWatchVideo,
  onVideoEnded,
  onCloseVideo,
  onGoToToolbox,
  onHelp,
  onShowCaughtUpMessage,
  onGoToChat
}) => {
  const navigate = useNavigate();
  const [preparationDialogOpen, setPreparationDialogOpen] = useState(false);
  const [upduoDialogOpen, setUpduoDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPartialReflection, setHasPartialReflection] = useState(false);

  const openUpduoInIframe = () => {
    setPreparationDialogOpen(true);
  };

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

  const handleContinueToUpduo = async () => {
    // Log reflection start
    await logReflectionStart();
    
    setPreparationDialogOpen(false);
    setIsLoading(true);
    setUpduoDialogOpen(true);
    // Reset loading after a short delay to simulate loading state
    setTimeout(() => setIsLoading(false), 800);
  };

  const handlePreparationDialogClose = () => {
    setPreparationDialogOpen(false);
  };

  // Handle dialog closing - check if status changed to refresh parent component
  const handleDialogClose = () => {
    setUpduoDialogOpen(false);
    // This will trigger a refetch in the parent component if using SWR or React Query
    // or you can implement a callback for explicit refetching
  };

  const handlePartialReflectionDetected = (hasPartial: boolean) => {
    setHasPartialReflection(hasPartial);
  };

  return (
    <Card className="border-2 border-primary/20 overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-primary/5 relative">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">
            {hasCompletedReflection ? "await a match" : "Complete a video reflection"}
          </CardTitle>
          {hasCompletedReflection ? <Badge variant="success" className="bg-green-500 shadow-sm px-3 py-1">Completed</Badge> : <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 px-3 py-1 font-semibold shadow-sm">Required</Badge>}
        </div>
        <CardDescription className="text-gray-700">
          {hasCompletedReflection ? "Thank you for recording your introduction! We're analyzing it to match you with compatible partners." : "Record a brief introduction about yourself to help us match you with compatible learning partners on sideby."}
        </CardDescription>
        {!hasCompletedReflection && <Progress value={videoFinished ? 40 : 20} className="h-1.5 mt-3 bg-gray-200" aria-label="Onboarding progress" />}
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col space-y-4">
          {!hasCompletedReflection && hasPartialReflection && <PartialReflectionAlert />}
          
          {!hasCompletedReflection && !hasPartialReflection && <TaskExplanationAlert />}

          {hasCompletedReflection ? <ReflectionCompletedAlert flowActivity={profileData?.approved_flow_activity} sessionData={sessionData} /> : videoFinished ? <CompletionDateAlert date={suggestedCompletion.date} pacingLabel={suggestedCompletion.pacingLabel} days={suggestedCompletion.days} /> : null}
        </div>
      </CardContent>
      <TaskCardFooter 
        hasCompletedReflection={hasCompletedReflection} 
        hasActiveMatch={hasActiveMatch}
        onGoToToolbox={onGoToToolbox} 
        onOpenUpduoWeb={openUpduoInIframe} 
        onShowCaughtUpMessage={onShowCaughtUpMessage} 
        onGoToChat={onGoToChat}
        onHelp={onHelp} 
      />
      
      <UpduoPreparationDialog
        isOpen={preparationDialogOpen}
        onClose={handlePreparationDialogClose}
        onContinue={handleContinueToUpduo}
        isLoading={isLoading}
      />
      
      <UpduoIframeDialog 
        isOpen={upduoDialogOpen} 
        onClose={handleDialogClose} 
        isLoading={isLoading}
        onPartialReflectionDetected={handlePartialReflectionDetected}
        mode="fullscreen"
      />
    </Card>
  );
};
