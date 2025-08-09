import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivityScoreMetrics {
  lastLoginDate?: string;
  engagementCount: number;
  recentEngagementCount: number;
  matchCount: number;
  profileCompleteness: number;
}

const WEIGHTS = {
  LOGIN_FREQUENCY: 0.25,
  ENGAGEMENT: 0.30,
  RECENT_ACTIVITY: 0.25,
  MATCH_INTERACTION: 0.20,
};

const handler = async (req: Request): Promise<Response> => {
  console.log('calculate-activity-scores function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Calculating activity score for user:', userId);

    // Get user metrics
    const metrics = await getUserMetrics(supabase, userId);
    
    // Calculate individual scores
    const loginFrequencyScore = calculateLoginFrequencyScore(metrics.lastLoginDate);
    const engagementScore = calculateEngagementScore(metrics.engagementCount);
    const recentActivityScore = calculateRecentActivityScore(metrics.recentEngagementCount);
    const matchInteractionScore = calculateMatchInteractionScore(metrics.matchCount);

    // Calculate overall score
    const overallScore = Math.round(
      loginFrequencyScore * WEIGHTS.LOGIN_FREQUENCY +
      engagementScore * WEIGHTS.ENGAGEMENT +
      recentActivityScore * WEIGHTS.RECENT_ACTIVITY +
      matchInteractionScore * WEIGHTS.MATCH_INTERACTION
    );

    // Upsert activity score
    const { data, error } = await supabase
      .from('activity_scores')
      .upsert({
        user_id: userId,
        overall_score: overallScore,
        login_frequency_score: loginFrequencyScore,
        engagement_score: engagementScore,
        recent_activity_score: recentActivityScore,
        match_interaction_score: matchInteractionScore,
        last_calculated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting activity score:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Activity score calculated successfully:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      metrics 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in calculate-activity-scores:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function getUserMetrics(supabase: any, userId: string): Promise<ActivityScoreMetrics> {
  const [userProfile, engagementLogs, matches] = await Promise.all([
    getUserProfile(supabase, userId),
    getEngagementLogs(supabase, userId),
    getUserMatches(supabase, userId)
  ]);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentEngagementCount = engagementLogs.filter((log: any) => 
    new Date(log.created_at) >= sevenDaysAgo
  ).length;

  return {
    lastLoginDate: userProfile?.updated_at,
    engagementCount: engagementLogs.length,
    recentEngagementCount,
    matchCount: matches.length,
    profileCompleteness: calculateProfileCompleteness(userProfile),
  };
}

async function getUserProfile(supabase: any, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

async function getEngagementLogs(supabase: any, userId: string) {
  const { data } = await supabase
    .from('engagement_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

async function getUserMatches(supabase: any, userId: string) {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('status', 'active');
  return data || [];
}

function calculateLoginFrequencyScore(lastLoginDate?: string): number {
  if (!lastLoginDate) return 0;

  const lastLogin = new Date(lastLoginDate);
  const now = new Date();
  const daysSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLogin <= 1) return 100;
  if (daysSinceLogin <= 3) return 80;
  if (daysSinceLogin <= 7) return 60;
  if (daysSinceLogin <= 14) return 40;
  if (daysSinceLogin <= 30) return 20;
  return 0;
}

function calculateEngagementScore(engagementCount: number): number {
  if (engagementCount >= 50) return 100;
  if (engagementCount >= 25) return 80;
  if (engagementCount >= 10) return 60;
  if (engagementCount >= 5) return 40;
  if (engagementCount >= 1) return 20;
  return 0;
}

function calculateRecentActivityScore(recentEngagementCount: number): number {
  if (recentEngagementCount >= 10) return 100;
  if (recentEngagementCount >= 5) return 80;
  if (recentEngagementCount >= 3) return 60;
  if (recentEngagementCount >= 1) return 40;
  return 0;
}

function calculateMatchInteractionScore(matchCount: number): number {
  if (matchCount >= 5) return 100;
  if (matchCount >= 3) return 80;
  if (matchCount >= 2) return 60;
  if (matchCount >= 1) return 40;
  return 0;
}

function calculateProfileCompleteness(profile: any): number {
  if (!profile) return 0;

  const fields = [
    'first_name',
    'last_name',
    'bio',
    'teaching_experience',
    'subjects',
    'avatar_url'
  ];

  const completedFields = fields.filter(field => {
    const value = profile[field];
    return value && (Array.isArray(value) ? value.length > 0 : value.trim().length > 0);
  }).length;

  return Math.round((completedFields / fields.length) * 100);
}

serve(handler);