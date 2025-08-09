import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserJourneyAnalyticsData {
  totalUsers: number;
  userGrowth: number;
  avgSessionTime: number;
  sessionTimeGrowth: number;
  completionRate: number;
  completionRateChange: number;
  engagementScore: number;
  engagementTrend: number;
  sessionAnalytics?: {
    totalSessions: number;
    averageDuration: number;
    sessionsByTimeOfDay: Array<{ hour: number; count: number }>;
    sessionsByDay: Array<{ date: string; count: number }>;
    bounceRate: number;
    returnRate: number;
  };
  learningAnalytics?: {
    progressionStages: Array<{ stage: string; count: number; percentage: number }>;
    completionFunnels: Array<{ step: string; completed: number; dropped: number }>;
    skillAcquisition: Array<{ skill: string; proficiency: number; trend: number }>;
    learningPaths: Array<{ path: string; users: number; completion: number }>;
  };
  cohortAnalytics?: {
    retentionCohorts: Array<{ cohort: string; week0: number; week1: number; week4: number; week12: number }>;
    engagementCohorts: Array<{ cohort: string; high: number; medium: number; low: number }>;
    learningCohorts: Array<{ cohort: string; fast: number; moderate: number; slow: number }>;
  };
  predictiveInsights?: {
    atRiskUsers: Array<{ userId: string; name: string; riskScore: number; reasons: string[] }>;
    growthPredictions: Array<{ metric: string; current: number; predicted: number; confidence: number }>;
    recommendations: Array<{ type: string; description: string; impact: number; effort: number }>;
  };
}

interface UseUserJourneyAnalyticsParams {
  timeRange: string;
  cohort: string;
  refreshKey: number;
}

export const useUserJourneyAnalytics = ({ timeRange, cohort, refreshKey }: UseUserJourneyAnalyticsParams) => {
  return useQuery({
    queryKey: ['userJourneyAnalytics', timeRange, cohort, refreshKey],
    queryFn: async (): Promise<UserJourneyAnalyticsData> => {
      console.log(`Fetching user journey analytics for ${timeRange}, cohort: ${cohort}`);
      
      // Get basic user data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, journey_stage, onboarding_completed');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw new Error('Failed to fetch user profiles');
      }

      // Get session data from multiple sources
      const { data: engagementLogs, error: engagementError } = await supabase
        .from('engagement_logs')
        .select('user_id, engagement_type, created_at, metadata');

      if (engagementError) {
        console.error('Error fetching engagement logs:', engagementError);
      }

      // Calculate date range for filtering
      const now = new Date();
      let startDate = new Date(now);
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Filter data based on time range
      const filteredProfiles = profiles?.filter(p => 
        new Date(p.created_at) >= startDate
      ) || [];
      
      const filteredEngagement = engagementLogs?.filter(e => 
        new Date(e.created_at) >= startDate
      ) || [];

      // Calculate key metrics
      const totalUsers = filteredProfiles.length;
      const userGrowth = calculateGrowthRate(filteredProfiles, startDate);
      
      // Session analytics from engagement logs
      const sessionAnalytics = calculateSessionAnalytics(filteredEngagement);
      
      // Learning progression analytics
      const learningAnalytics = calculateLearningAnalytics(filteredProfiles);
      
      // Cohort analysis
      const cohortAnalytics = calculateCohortAnalytics(filteredProfiles, filteredEngagement);
      
      // Predictive insights
      const predictiveInsights = calculatePredictiveInsights(filteredProfiles, filteredEngagement);

      return {
        totalUsers,
        userGrowth,
        avgSessionTime: sessionAnalytics.averageDuration,
        sessionTimeGrowth: 5.2, // Mock data for now
        completionRate: learningAnalytics.overallCompletion,
        completionRateChange: 2.1, // Mock data
        engagementScore: sessionAnalytics.engagementScore,
        engagementTrend: 3.4, // Mock data
        sessionAnalytics,
        learningAnalytics,
        cohortAnalytics,
        predictiveInsights
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

// Helper functions for calculations
function calculateGrowthRate(profiles: any[], startDate: Date): number {
  const midpoint = new Date(startDate);
  midpoint.setTime(startDate.getTime() + (Date.now() - startDate.getTime()) / 2);
  
  const firstHalf = profiles.filter(p => new Date(p.created_at) <= midpoint).length;
  const secondHalf = profiles.filter(p => new Date(p.created_at) > midpoint).length;
  
  return firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
}

function calculateSessionAnalytics(engagementLogs: any[]) {
  const totalSessions = engagementLogs.length;
  const averageDuration = 24; // Mock - would calculate from actual session data
  
  // Session distribution by hour
  const sessionsByTimeOfDay = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: engagementLogs.filter(log => new Date(log.created_at).getHours() === hour).length
  }));
  
  // Sessions by day for the last 7 days
  const sessionsByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      count: engagementLogs.filter(log => 
        log.created_at.startsWith(dateStr)
      ).length
    };
  }).reverse();

  return {
    totalSessions,
    averageDuration,
    sessionsByTimeOfDay,
    sessionsByDay,
    bounceRate: 15.2, // Mock data
    returnRate: 68.5, // Mock data
    engagementScore: 75.3 // Mock data
  };
}

function calculateLearningAnalytics(profiles: any[]) {
  const stages = ['new', 'onboarding', 'active', 'completed'];
  const progressionStages = stages.map(stage => ({
    stage,
    count: profiles.filter(p => p.journey_stage === stage).length,
    percentage: (profiles.filter(p => p.journey_stage === stage).length / profiles.length) * 100
  }));

  return {
    progressionStages,
    overallCompletion: profiles.filter(p => p.onboarding_completed).length / profiles.length * 100,
    completionFunnels: [
      { step: 'Registration', completed: profiles.length, dropped: 0 },
      { step: 'Profile Setup', completed: Math.floor(profiles.length * 0.85), dropped: Math.floor(profiles.length * 0.15) },
      { step: 'First Session', completed: Math.floor(profiles.length * 0.72), dropped: Math.floor(profiles.length * 0.13) },
      { step: 'Completion', completed: Math.floor(profiles.length * 0.58), dropped: Math.floor(profiles.length * 0.14) }
    ],
    skillAcquisition: [
      { skill: 'Communication', proficiency: 78, trend: 5.2 },
      { skill: 'Collaboration', proficiency: 65, trend: 3.1 },
      { skill: 'Critical Thinking', proficiency: 82, trend: 2.8 }
    ],
    learningPaths: [
      { path: 'Basic Skills', users: Math.floor(profiles.length * 0.6), completion: 73 },
      { path: 'Advanced Learning', users: Math.floor(profiles.length * 0.3), completion: 45 },
      { path: 'Expert Track', users: Math.floor(profiles.length * 0.1), completion: 28 }
    ]
  };
}

function calculateCohortAnalytics(profiles: any[], engagementLogs: any[]) {
  // Mock cohort data - would be calculated from actual retention data
  return {
    retentionCohorts: [
      { cohort: 'Jan 2024', week0: 100, week1: 85, week4: 72, week12: 58 },
      { cohort: 'Feb 2024', week0: 100, week1: 88, week4: 75, week12: 62 },
      { cohort: 'Mar 2024', week0: 100, week1: 82, week4: 68, week12: 55 }
    ],
    engagementCohorts: [
      { cohort: 'High Performers', high: 85, medium: 12, low: 3 },
      { cohort: 'Regular Users', high: 25, medium: 60, low: 15 },
      { cohort: 'Casual Users', high: 5, medium: 35, low: 60 }
    ],
    learningCohorts: [
      { cohort: 'Fast Learners', fast: 70, moderate: 25, slow: 5 },
      { cohort: 'Steady Progress', fast: 20, moderate: 65, slow: 15 },
      { cohort: 'Need Support', fast: 5, moderate: 30, slow: 65 }
    ]
  };
}

function calculatePredictiveInsights(profiles: any[], engagementLogs: any[]) {
  return {
    atRiskUsers: [
      { userId: 'user1', name: 'John Doe', riskScore: 78, reasons: ['Low engagement', 'Missed sessions'] },
      { userId: 'user2', name: 'Jane Smith', riskScore: 65, reasons: ['Incomplete profile', 'No recent activity'] }
    ],
    growthPredictions: [
      { metric: 'User Growth', current: 1250, predicted: 1580, confidence: 85 },
      { metric: 'Engagement Rate', current: 68, predicted: 74, confidence: 78 },
      { metric: 'Completion Rate', current: 58, predicted: 65, confidence: 72 }
    ],
    recommendations: [
      { type: 'Engagement', description: 'Implement push notifications for inactive users', impact: 15, effort: 30 },
      { type: 'Content', description: 'Add intermediate difficulty learning paths', impact: 22, effort: 60 },
      { type: 'UX', description: 'Simplify onboarding flow', impact: 18, effort: 40 }
    ]
  };
}