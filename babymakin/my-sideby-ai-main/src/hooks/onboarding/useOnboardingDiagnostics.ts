import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticData {
  userId: string;
  profileExists: boolean;
  profileData: any;
  valuesAcknowledged: boolean;
  communityMembership: any;
  pacingPreferences: any;
  phoneNumber: string | null;
  sessionFlags: Record<string, string | null>;
  timestamp: string;
}

interface OnboardingIssue {
  type: 'profile_missing' | 'values_missing' | 'community_missing' | 'pacing_missing' | 'phone_missing' | 'session_conflict';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  resolution?: string;
  data?: any;
}

export const useOnboardingDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [issues, setIssues] = useState<OnboardingIssue[]>([]);
  const { toast } = useToast();

  const runDiagnostics = useCallback(async (userId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required for diagnostics",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    console.log('[OnboardingDiagnostics] Running comprehensive diagnostics for user:', userId);

    try {
      const startTime = Date.now();
      
      // Collect all session storage flags
      const sessionFlags = {
        values_acknowledged: sessionStorage.getItem('values_acknowledged'),
        onboarding_just_completed: sessionStorage.getItem('onboarding_just_completed'),
        onboarding_completion_time: sessionStorage.getItem('onboarding_completion_time'),
      };

      // Run all checks in parallel for faster diagnostics
      const [profileResult, valuesResult, communityResult, pacingResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        
        supabase
          .from('values_acknowledgment')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        
        supabase
          .from('community_members')
          .select('*, communities(*)')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle(),
        
        supabase
          .from('user_pacing_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      const diagnosticData: DiagnosticData = {
        userId,
        profileExists: !profileResult.error && !!profileResult.data,
        profileData: profileResult.data,
        valuesAcknowledged: !valuesResult.error && !!valuesResult.data,
        communityMembership: communityResult.data,
        pacingPreferences: pacingResult.data,
        phoneNumber: profileResult.data?.phone_number || null,
        sessionFlags,
        timestamp: new Date().toISOString()
      };

      const detectedIssues: OnboardingIssue[] = [];

      // Check for critical issues
      if (!diagnosticData.profileExists) {
        detectedIssues.push({
          type: 'profile_missing',
          severity: 'critical',
          message: 'User profile does not exist in database',
          resolution: 'Profile creation required before onboarding can proceed'
        });
      }

      if (!diagnosticData.valuesAcknowledged && sessionFlags.values_acknowledged !== 'true') {
        detectedIssues.push({
          type: 'values_missing',
          severity: 'warning',
          message: 'Values acknowledgment not found in database or session',
          resolution: 'User needs to complete values acknowledgment step'
        });
      }

      if (!diagnosticData.communityMembership && diagnosticData.profileExists) {
        detectedIssues.push({
          type: 'community_missing',
          severity: 'warning',
          message: 'No active community membership found',
          resolution: 'User needs to select and join a community'
        });
      }

      if (!diagnosticData.pacingPreferences && diagnosticData.communityMembership) {
        detectedIssues.push({
          type: 'pacing_missing',
          severity: 'warning',
          message: 'Pacing preferences not set',
          resolution: 'User needs to complete pacing selection step'
        });
      }

      if (!diagnosticData.phoneNumber && diagnosticData.pacingPreferences) {
        detectedIssues.push({
          type: 'phone_missing',
          severity: 'info',
          message: 'Phone number not provided',
          resolution: 'User can complete phone setup or skip this step'
        });
      }

      // Check for session/database conflicts
      if (sessionFlags.onboarding_just_completed === 'true' && !diagnosticData.profileData?.onboarding_completed) {
        detectedIssues.push({
          type: 'session_conflict',
          severity: 'warning',
          message: 'Session indicates onboarding complete but database shows incomplete',
          resolution: 'Database update may have failed, retry completion'
        });
      }

      const executionTime = Date.now() - startTime;
      
      console.log('[OnboardingDiagnostics] Completed in', executionTime, 'ms. Found', detectedIssues.length, 'issues');
      
      setDiagnosticData(diagnosticData);
      setIssues(detectedIssues);

      if (detectedIssues.length === 0) {
        toast({
          title: "Diagnostics Complete",
          description: "No issues detected with onboarding flow"
        });
      } else {
        const criticalCount = detectedIssues.filter(i => i.severity === 'critical').length;
        const warningCount = detectedIssues.filter(i => i.severity === 'warning').length;
        
        toast({
          title: "Diagnostics Complete",
          description: `Found ${criticalCount} critical and ${warningCount} warning issues`,
          variant: criticalCount > 0 ? "destructive" : "default"
        });
      }

    } catch (error) {
      console.error('[OnboardingDiagnostics] Error running diagnostics:', error);
      toast({
        title: "Diagnostic Error",
        description: "Failed to run onboarding diagnostics",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  }, [toast]);

  const exportDiagnostics = useCallback(() => {
    if (!diagnosticData) return;

    const exportData = {
      ...diagnosticData,
      issues,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-diagnostics-${diagnosticData.userId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [diagnosticData, issues]);

  return {
    isRunning,
    diagnosticData,
    issues,
    runDiagnostics,
    exportDiagnostics
  };
};