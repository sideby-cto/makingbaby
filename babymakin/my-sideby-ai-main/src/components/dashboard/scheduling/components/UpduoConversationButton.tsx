
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { UpduoIframeDialog } from "@/components/upduo/UpduoIframeDialog";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUpduoSession } from "@/hooks/useUpduoSession";
import { cn } from "@/lib/utils";
import { UpduoUIConfig } from "@/types/upduo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UpduoConversationButtonProps {
  partnerName: string;
  className?: string;
  mode?: 'embedded' | 'fullscreen' | 'dialog';
  communityCode?: string;
  uiConfig?: UpduoUIConfig;
}

export const UpduoConversationButton: React.FC<UpduoConversationButtonProps> = ({
  partnerName,
  className = "",
  mode = 'embedded',
  communityCode = 'washington',
  uiConfig = {
    hideNavigation: true,  // Hide navigation by default for conversations
    hideHeader: false,
    hideSidebar: true      // Hide sidebar by default for conversations
  }
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, supabaseUser } = useAuth();
  const {
    isSessionActive,
    isLoading,
    error,
    startSession,
    endSession,
    handleError,
    isEmbedded
  } = useUpduoSession({
    defaultMode: mode,
    defaultSessionType: 'conversation',
    communityCode
  });
  
  const logSessionStart = async () => {
    if (!user || !supabaseUser) return;
    
    try {
      const userDisplayName = supabaseUser.user_metadata?.first_name && supabaseUser.user_metadata?.last_name
        ? `${supabaseUser.user_metadata.first_name} ${supabaseUser.user_metadata.last_name}`
        : supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0] || 'Unknown User';

      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          user_name: userDisplayName,
          session_partner: partnerName
        });
    } catch (error) {
      console.error('Failed to log session start:', error);
    }
  };

  const handleStartSession = async () => {
    await logSessionStart();
    startSession(mode, 'conversation');
  };
  
  const handleCloseSession = () => {
    endSession();
    toast({
      title: "Conversation ended",
      description: "You've ended your sideby session",
      duration: 3000,
    });
  };
  
  const handleRetry = () => {
    handleError('');
    startSession(mode, 'conversation');
  };
  
  // For embedded mode, we render differently
  if (isEmbedded) {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-3 sm:mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm">
                Unable to connect to Upduo: {error}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                className="gap-1 w-full sm:w-auto"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isSessionActive ? (
          <Button 
            onClick={handleStartSession} 
            className={cn(
              "bg-palette-highlighter-yellow hover:bg-palette-highlighter-yellow/90 text-sideby-blue-500 flex items-center justify-center gap-2 w-full",
              "text-xs sm:text-sm md:text-base py-2 sm:py-3 font-bold shadow-lg",
              className
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin" />
            ) : (
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            )}
            <span className="text-center leading-tight text-sideby-blue-500">
              Start your sideby session with {partnerName}
            </span>
          </Button>
        ) : (
          <UpduoIframeDialog 
            mode="embedded"
            isOpen={true}
            onClose={handleCloseSession} 
            isLoading={isLoading}
            onError={handleError}
            communityCode={communityCode}
            partnerName={partnerName}
            sessionType="conversation"
            uiConfig={uiConfig}
          />
        )}
      </div>
    );
  }
  
  // For dialog/fullscreen modes (legacy behavior)
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-3 sm:mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs sm:text-sm">
              Unable to connect to Upduo: {error}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              className="gap-1 w-full sm:w-auto"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleStartSession} 
        className={cn(
          "bg-palette-highlighter-yellow hover:bg-palette-highlighter-yellow/90 text-sideby-blue-500 flex items-center justify-center gap-2 w-full",
          "text-xs sm:text-sm md:text-base py-2 sm:py-3 font-bold shadow-lg",
          className
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin" />
        ) : (
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        )}
        <span className="text-center leading-tight text-sideby-blue-500">
          Start your sideby session with {partnerName}
        </span>
      </Button>
      
      <UpduoIframeDialog 
        isOpen={isSessionActive} 
        onClose={handleCloseSession} 
        isLoading={isLoading}
        onError={handleError}
        communityCode={communityCode}
        partnerName={partnerName}
        sessionType="conversation"
        mode={mode}
        uiConfig={uiConfig}
      />
    </>
  );
};
