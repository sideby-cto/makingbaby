
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get beta users
    const { data: betaUsers, error: betaError } = await supabase
      .from('beta_users')
      .select('user_id, features');

    if (betaError) {
      throw new Error(`Error fetching beta users: ${betaError.message}`);
    }

    if (!betaUsers || betaUsers.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No beta users to process'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Process beta users
    const betaUserIds = betaUsers.map((u) => u.user_id);

    // Get profiles for beta users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, created_at, first_name, last_name, email')
      .in('id', betaUserIds);

    if (profileError) {
      throw new Error(`Error fetching profiles: ${profileError.message}`);
    }

    // Results tracking
    const results = {
      processed: 0,
      notificationsSent: 0,
      adminAlerts: 0,
      errors: 0
    };

    // Process each beta user
    for (const profile of profiles || []) {
      try {
        results.processed++;

        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const daysSinceRegistration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dayInCycle = daysSinceRegistration % 30;

        const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;

        // Day 1: Send welcome notification
        if (dayInCycle === 1) {
          await createNotification(supabase, {
            userId: profile.id,
            title: 'Welcome to Your First Week!',
            content: 'This week, explore the tools in sideby, set up your profile, and add a few "hats" to help us match you with the right partners.'
          });
          results.notificationsSent++;
        }

        // Day 7: Notify admins about approaching match deadline
        if (dayInCycle === 7) {
          // Find admin users
          const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .like('email', '%@sideby.ai');

          if (admins && admins.length > 0) {
            for (const admin of admins) {
              await createNotification(supabase, {
                userId: admin.id,
                title: 'Beta User Day 7 Alert',
                content: `Beta user ${userName} has reached Day 7 and needs a match soon.`,
                data: {
                  isAdminAlert: true,
                  betaUserId: profile.id,
                  daysSinceRegistration,
                  dayInCycle
                }
              });
            }
            results.adminAlerts++;
          }
        }

        // Day 9: Check if user has a match, notify if they do
        if (dayInCycle === 9) {
          // Check if user has any active matches
          const { data: matches } = await supabase
            .from('matches')
            .select('id')
            .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
            .eq('status', 'active');

          if (matches && matches.length > 0) {
            await createNotification(supabase, {
              userId: profile.id,
              title: 'Your Learning Match is Ready!',
              content: 'Good news! We\'ve found you a learning partner. Check your dashboard to connect and schedule a time to meet.'
            });
            results.notificationsSent++;
          } else {
            // Alert admins if no match by day 9
            const { data: admins } = await supabase
              .from('profiles')
              .select('id')
              .like('email', '%@sideby.ai');

            if (admins && admins.length > 0) {
              for (const admin of admins) {
                await createNotification(supabase, {
                  userId: admin.id,
                  title: 'URGENT: Beta User Without Match',
                  content: `Beta user ${userName} has reached Day 9 but has no active match.`,
                  data: {
                    isAdminAlert: true,
                    betaUserId: profile.id,
                    daysSinceRegistration,
                    dayInCycle,
                    urgent: true
                  }
                });
              }
              results.adminAlerts++;
            }
          }
        }

        // Day 30: End of cycle notification
        if (dayInCycle === 0 || dayInCycle === 30) {
          await createNotification(supabase, {
            userId: profile.id,
            title: 'Monthly Cycle Complete',
            content: 'Congratulations on completing your monthly beta cycle! Next month starts soon with new opportunities to explore tools and matches.'
          });
          results.notificationsSent++;
        }
      } catch (userError) {
        console.error(`Error processing beta user ${profile.id}:`, userError);
        results.errors++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in process-beta-notifications function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

// Helper to create notifications
async function createNotification(supabase, params) {
  const { userId, title, content, data = {} } = params;
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'system',
      title,
      content,
      data: {
        ...data,
        isBetaNotification: true,
        timestamp: new Date().toISOString()
      },
      read: false
    });
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}
