
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChatHeader } from "../components/ChatHeader";
import { CalendarInviteController } from "../components/calendar-invite/CalendarInviteController";
import { MatchRationaleCard } from "../components/MatchRationaleCard";
import { RealtimeStatusIndicator } from "../components/RealtimeStatusIndicator";
import { RealtimeDebugPanel } from "../components/RealtimeDebugPanel";
import { useHybridMessageFetching } from "../hooks/useHybridMessageFetching";
import { usePartnerInfoFromMatch } from "../hooks/usePartnerInfoFromMatch";
import { transformMessageData } from "../utils/messageTransformUtils";
import { supabase } from "@/integrations/supabase/client";
import { useMeetingTimeStatus } from "../hooks/useMeetingTimeStatus";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ChatLoadingState } from "./components/ChatLoadingState";
import { ChatMainContent } from "./components/ChatMainContent";
import { ChatFooterSection } from "./components/ChatFooterSection";
import { useFileUpload } from "./hooks/useFileUpload";
import { useMessageHandlers } from "./hooks/useMessageHandlers";
import { useMyTools } from "@/hooks/useMyTools";
import { useRealtimeSubscriptionFix } from "../hooks/useRealtimeSubscriptionFix";
import { SchedulerSelectionDialog } from "../components/SchedulerSelectionDialog";
import { CustomTool } from "@/types/tools";

interface MatchProps {
  id: string;
  user1_id: string;
  user2_id: string;
  status?: string;
  completed_at?: string;
  completion_notes?: string | null;
  completed_by?: string | null;
  upduo_session_id?: string | null;
  upduo_session_name?: string | null;
  rationale?: string;
  created_at?: string;
  user1?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  };
  user2?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  };
}

interface SchedulingChatContainerProps {
  match: MatchProps;
  userId: string;
}

export const SchedulingChatContainer = ({ match, userId }: SchedulingChatContainerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentMatchIdRef = useRef<string>(match.id);
  const isInitialRenderRef = useRef(true);
  
  // Update the ref when match actually changes
  useEffect(() => {
    currentMatchIdRef.current = match.id;
  }, [match.id]);

  // Use hybrid message fetching for better reliability
  const { partnerInfo } = usePartnerInfoFromMatch(match.id, userId);
  
  // Get scheduler tools
  const { getSchedulerTools } = useMyTools();
  const [showSchedulerDialog, setShowSchedulerDialog] = useState(false);
  
  const {
    messages,
    isLoading: loading,
    error,
    isRealtimeActive,
    addMessage,
    refresh
  } = useHybridMessageFetching({
    matchId: match.id,
    userId,
    partnerInfo,
    pollingInterval: 3000
  });

  // Keep existing state and hooks for sending messages
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Simple send message function
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || isSending) return false;

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('match_scheduling_messages')
        .insert({
          match_id: match.id,
          sender_id: userId,
          content: content.trim(),
          sender_type: 'user'
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state optimistically
      if (data && partnerInfo) {
        const transformedMessage = transformMessageData(data, userId, partnerInfo);
        addMessage(transformedMessage);
      }
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSending(false);
    }
  }, [match.id, userId, partnerInfo, isSending, addMessage, toast]);

  const { 
    hasConfirmedMeeting, 
    meetingTime, 
    formattedMeetingTime, 
    refreshMeetingTime 
  } = useMeetingTimeStatus(match.id);

  // Memoize the partner info to prevent unnecessary re-renders
  const memoizedPartnerInfo = useMemo(() => partnerInfo, [partnerInfo?.name, partnerInfo?.avatar_url]);

  // Mark as no longer initial render after first load
  useEffect(() => {
    if (!loading && isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
    }
  }, [loading]);

  // Custom hooks for cleaner code
  const { isUploading, handleUploadFile } = useFileUpload({ matchId: match.id, sendMessage });
  const { handleSendMessage, handleKeyPress } = useMessageHandlers({ 
    newMessage, 
    setNewMessage, 
    sendMessage 
  });

  // Handle scheduler dropping
  const handleDropScheduler = () => {
    const schedulerTools = getSchedulerTools();
    if (schedulerTools.length === 0) {
      setShowSchedulerDialog(true);
    } else if (schedulerTools.length === 1) {
      insertSchedulerMessage(schedulerTools[0]);
    } else {
      setShowSchedulerDialog(true);
    }
  };

  const insertSchedulerMessage = (scheduler: CustomTool) => {
    const schedulerMessage = `Here's my scheduler link to book a time that works for both of us:\n\n📅 ${scheduler.name}\n${scheduler.url}\n\nLooking forward to our conversation!`;
    sendMessage(schedulerMessage);
  };

  const handleMatchDeleted = () => {
    toast({
      title: "Match deleted",
      description: "Redirecting to your dashboard...",
    });
    
    // Redirect to dashboard or refresh the page
    navigate('/dashboard');
  };

  // Use realtime subscription fix
  useRealtimeSubscriptionFix({ 
    matchId: match.id, 
    onRetry: refresh 
  });

  // ENHANCED DEBUG: Comprehensive debugging for missing buttons issue
  const schedulerTools = getSchedulerTools();
  const debugInfo = {
    schedulerToolsCount: schedulerTools.length,
    schedulerTools: schedulerTools.map(t => ({ 
      id: t.id,
      name: t.name, 
      url: t.url, 
      type: t.type,
      metadata: t.metadata 
    })),
    hasSchedulerTools: schedulerTools.length > 0,
    handleDropScheduler: !!handleDropScheduler,
    handleUploadFile: !!handleUploadFile,
    matchStatus: match.status,
    isCompleted: match.status === "completed",
    // Function source debugging
    handleDropSchedulerSource: handleDropScheduler.toString().substring(0, 200),
    handleUploadFileSource: handleUploadFile.toString().substring(0, 200),
    // Props that will be passed down
    propsToPass: {
      onDropScheduler: !!handleDropScheduler,
      onUpload: !!handleUploadFile,
      disabled: match.status === "completed"
    }
  };
  
  console.log("SchedulingChatContainer ENHANCED DEBUG:", debugInfo);
  
  // Add periodic debugging to track state changes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Periodic DEBUG - Tools and handlers status:", {
        timestamp: new Date().toISOString(),
        schedulerToolsCount: getSchedulerTools().length,
        handlersExist: {
          dropScheduler: !!handleDropScheduler,
          uploadFile: !!handleUploadFile
        },
        matchStatus: match.status
      });
    }, 10000); // Log every 10 seconds
    
    return () => clearInterval(interval);
  }, [match.status, handleDropScheduler, handleUploadFile, getSchedulerTools]);

  // Show loading state while loading messages or partner info
  if (loading && !memoizedPartnerInfo) {
    return <ChatLoadingState />;
  }

  return (
    <div className="flex flex-col h-full max-h-[100vh] sm:max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-120px)] border-0 sm:border sm:rounded-lg overflow-hidden bg-background">
      {/* Header */}
      {memoizedPartnerInfo && (
        <div className="flex-shrink-0">
          <ChatHeader
            partnerName={memoizedPartnerInfo.name}
            partnerAvatar={memoizedPartnerInfo.avatar_url}
            matchId={match.id}
            matchCreatedAt={match.created_at}
            partnerInfo={memoizedPartnerInfo}
            userId={userId}
            onMatchDeleted={handleMatchDeleted}
          />
        </div>
      )}

      {/* Real-time Status Indicator - Hidden on mobile for space */}
      <div className="flex-shrink-0 px-3 md:px-4 py-2 hidden sm:block">
        <RealtimeStatusIndicator 
          isRealtimeActive={isRealtimeActive} 
          onRefresh={refresh}
        />
      </div>

      {/* Match Rationale Card */}
      <MatchRationaleCard rationale={match.rationale || null} matchId={match.id} createdAt={match.created_at} />
      
      {/* Messages - This is the main scrollable area */}
      <ChatMainContent
        loading={loading}
        messages={messages}
        partnerInfo={memoizedPartnerInfo}
        matchId={match.id}
        matchCreatedAt={match.created_at}
      />
      
      {/* Bottom sections - fixed at bottom */}
      <ChatFooterSection
        hasConfirmedMeeting={hasConfirmedMeeting}
        formattedMeetingTime={formattedMeetingTime}
        partnerInfo={memoizedPartnerInfo}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        isSending={isSending}
        isUploading={isUploading}
        handleUploadFile={handleUploadFile}
        handleDropScheduler={handleDropScheduler}
        matchStatus={match.status}
      />
      
      {/* Scheduler Selection Dialog */}
      <SchedulerSelectionDialog
        open={showSchedulerDialog}
        onOpenChange={setShowSchedulerDialog}
        schedulerTools={getSchedulerTools()}
        onSelectScheduler={insertSchedulerMessage}
      />
      
      {/* Debug Panel for Development */}
      {process.env.NODE_ENV === 'development' && (
        <RealtimeDebugPanel
          matchId={match.id}
          messages={messages}
          partnerInfo={memoizedPartnerInfo}
          onRefreshMessages={refresh}
        />
      )}
    </div>
  );
};
