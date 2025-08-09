
import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { DashboardErrorBoundary } from "@/components/dashboard/layout/DashboardErrorBoundary";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMessageContext } from "@/contexts/MessageContext";
import subscriptionManager from "@/services/subscriptions/subscriptionManager";
import { Toaster } from "@/components/ui/toaster";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Seo } from "@/components/seo/Seo";

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { setMatchRationale } = useMessageContext();
  const { startMeasure, endMeasure } = usePerformanceMonitor('Dashboard');
  
  // Simplified loading state management - remove aggressive scroll locking
  useEffect(() => {
    startMeasure('dashboardInit');
    
    // Simple cleanup on unmount
    return () => {
      endMeasure('dashboardInit');
    };
  }, [startMeasure, endMeasure]);

  // Optimized match information fetching with error handling
  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchMatchInfo = async () => {
      try {
        const { data: matches, error } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching match info:', error);
          return;
        }
        
        if (matches && matches.length > 0) {
          const match = matches[0];
          if (match.id && match.rationale) {
            setMatchRationale(match.id, match.rationale);
          }
        }
      } catch (error) {
        console.error('Error in fetchMatchInfo:', error);
      }
    };
    
    fetchMatchInfo();
  }, [profile?.id, setMatchRationale]);


  // Simplified cleanup management
  useEffect(() => {
    return () => {
      console.log("Dashboard unmounting - cleaning up subscriptions");
      subscriptionManager.cleanup();
    };
  }, []);

  // Consolidated loading state with better error handling
  if (loading || !user) {
    return (
      <>
        <Seo title="Dashboard | sideby" description="sideby dashboard: matches, learning, and updates." />
        <LoadingFallback 
          message="Loading your dashboard..." 
          showNetworkStatus={true}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Seo title="Dashboard | sideby" description="sideby dashboard: matches, learning, and updates." />
      <DashboardErrorBoundary>
        <DashboardLayout loading={false}>
          <DashboardContent 
            profile={profile}
          />
        </DashboardLayout>
        <Toaster />
      </DashboardErrorBoundary>
    </>
  );
};

export default Dashboard;
