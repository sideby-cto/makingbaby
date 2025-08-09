
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import type { JourneyData } from "@/hooks/user-journey/types";

export const useInitialTasksData = (userId: string, journeyData: JourneyData | undefined) => {
  // Keep the video states for backward compatibility
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [hasCompletedReflection, setHasCompletedReflection] = useState(false);
  const [hasActiveMatch, setHasActiveMatch] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate suggested completion date (7 days from today)
  const today = new Date();
  const suggestedDate = addDays(today, 7);
  const formattedDate = format(suggestedDate, 'MMMM d, yyyy');
  
  const suggestedCompletion = {
    date: formattedDate,
    pacingLabel: 'On Track',
    days: 7
  };

  const handleGoToToolbox = () => {
    navigate('/toolbox');
  };

  // Keep these handlers for compatibility, even though they're not used actively
  const handleWatchVideo = () => {
    setVideoOpen(true);
  };

  const handleVideoEnded = () => {
    setVideoOpen(false);
    setVideoFinished(true);
  };

  const handleCloseVideo = () => {
    setVideoOpen(false);
  };

  const handleHelpClick = () => {
    toast({
      title: "Help with sideby",
      description: "Our team is here to help! Navigate to the toolbox page for more resources.",
    });
  };

  const handleGoToChat = () => {
    navigate('/partners');
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Check if user has completed reflection already
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('has_completed_reflection, approved_flow_activity')
          .eq('id', userId)
          .single();

        if (error) throw error;
        
        if (profile) {
          setProfileData(profile);
          setHasCompletedReflection(profile.has_completed_reflection || false);
        }

        // Check if user has active matches and fetch session data
        if (profile?.has_completed_reflection) {
          const { data: matches, error: matchError } = await supabase
            .from("matches")
            .select("id, upduo_session_id, upduo_session_name")
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .eq('status', 'active')
            .limit(1);
          
          if (matchError) throw matchError;
          
          if (matches && matches.length > 0) {
            setHasActiveMatch(true);
            setActiveMatchId(matches[0].id);
            
            // Set session data if available
            if (matches[0].upduo_session_id || matches[0].upduo_session_name) {
              setSessionData({
                upduo_session_id: matches[0].upduo_session_id,
                upduo_session_name: matches[0].upduo_session_name,
                participants: 2, // Default for peer matches
                duration: "60 minutes", // Default duration
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    if (userId) {
      fetchProfileData();
    }
    
    // Also use journeyData if available (which may be more up-to-date)
    if (journeyData) {
      setHasCompletedReflection(journeyData.hasCompletedReflection);
      
      // If journeyData shows an active match
      if (journeyData.matchCount > 0) {
        setHasActiveMatch(true);
      }
    }
  }, [userId, journeyData]);

  return {
    videoOpen,
    videoFinished,
    hasCompletedReflection,
    hasActiveMatch,
    activeMatchId,
    suggestedCompletion,
    profileData,
    sessionData,
    handleGoToToolbox,
    handleWatchVideo,
    handleVideoEnded,
    handleCloseVideo,
    handleHelpClick,
    handleGoToChat
  };
};
