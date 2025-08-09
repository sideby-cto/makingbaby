import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  // Initialize Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    // Parse request body
    const requestBody = await req.json();
    const { check_only = false, initialize = false } = requestBody;
    console.log("Request params:", {
      check_only,
      initialize
    });
    // If check_only is true, just return success
    if (check_only) {
      console.log("Checking edge function availability");
      return new Response(JSON.stringify({
        success: true,
        message: "Edge function is available"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
    // Create journey_stage_config table if it doesn't exist
    try {
      // Check if the table exists
      const { error: checkError } = await supabase.from('journey_stage_config').select('id', {
        count: 'exact',
        head: true
      });
      // If the table doesn't exist, create it
      if (checkError && checkError.message.includes("does not exist")) {
        console.log("Creating journey_stage_config table");
        // Direct SQL approach using RPC
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS public.journey_stage_config (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              stage TEXT NOT NULL,
              reminder_times JSONB NOT NULL DEFAULT '{"24h": true, "48h": true, "weekly": true}'::jsonb,
              welcome_email_enabled BOOLEAN NOT NULL DEFAULT true,
              welcome_email_delay_hours INTEGER NOT NULL DEFAULT 0,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            -- Add RLS policies
            ALTER TABLE public.journey_stage_config ENABLE ROW LEVEL SECURITY;
            
            -- Anyone can select (read) from this table
            DROP POLICY IF EXISTS "Allow anyone to read journey config" ON public.journey_stage_config;
            CREATE POLICY "Allow anyone to read journey config" 
              ON public.journey_stage_config FOR SELECT 
              USING (true);
            
            -- Only users with @sideby.ai emails can modify this table
            DROP POLICY IF EXISTS "Allow admins to modify journey config" ON public.journey_stage_config;
            CREATE POLICY "Allow admins to modify journey config" 
              ON public.journey_stage_config
              USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid()
                  AND profiles.email LIKE '%@sideby.ai'
                )
              );
          `
        });
        if (createError) {
          console.error("Error creating journey_stage_config table:", createError);
        }
      }
    } catch (configError) {
      console.error("Error with config table:", configError);
    }
    // Create journey_reminder_templates table if it doesn't exist
    try {
      // Check if the table exists
      const { error: checkError } = await supabase.from('journey_reminder_templates').select('id', {
        count: 'exact',
        head: true
      });
      // If the table doesn't exist, create it
      if (checkError && checkError.message.includes("does not exist")) {
        console.log("Creating journey_reminder_templates table");
        // Direct SQL approach using RPC
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS public.journey_reminder_templates (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              stage TEXT NOT NULL,
              reminder_type TEXT NOT NULL,
              subject TEXT NOT NULL,
              content TEXT NOT NULL,
              active BOOLEAN DEFAULT true,
              cta_text TEXT,
              cta_url TEXT,
              created_at TIMESTAMPTZ DEFAULT now(),
              updated_at TIMESTAMPTZ DEFAULT now()
            );
            
            -- Add RLS policies
            ALTER TABLE public.journey_reminder_templates ENABLE ROW LEVEL SECURITY;
            
            -- Anyone can select (read) from this table
            DROP POLICY IF EXISTS "Allow anyone to read journey templates" ON public.journey_reminder_templates;
            CREATE POLICY "Allow anyone to read journey templates" 
              ON public.journey_reminder_templates FOR SELECT 
              USING (true);
            
            -- Only users with @sideby.ai emails can modify this table
            DROP POLICY IF EXISTS "Allow admins to modify journey templates" ON public.journey_reminder_templates;
            CREATE POLICY "Allow admins to modify journey templates" 
              ON public.journey_reminder_templates
              USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid()
                  AND profiles.email LIKE '%@sideby.ai'
                )
              );
          `
        });
        if (createError) {
          console.error("Error creating journey_reminder_templates table:", createError);
        }
      }
    } catch (templateError) {
      console.error("Error with template table:", templateError);
    }
    // Create journey_reminder_logs table if it doesn't exist
    try {
      // Check if the table exists
      const { error: checkError } = await supabase.from('journey_reminder_logs').select('id', {
        count: 'exact',
        head: true
      });
      // If the table doesn't exist, create it
      if (checkError && checkError.message.includes("does not exist")) {
        console.log("Creating journey_reminder_logs table");
        // Direct SQL approach using RPC
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS public.journey_reminder_logs (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              stage TEXT NOT NULL,
              reminder_type TEXT NOT NULL,
              template_id UUID REFERENCES journey_reminder_templates(id),
              notification_id UUID,
              success BOOLEAN DEFAULT true,
              sent_at TIMESTAMPTZ DEFAULT now()
            );
            
            -- Add RLS policies
            ALTER TABLE public.journey_reminder_logs ENABLE ROW LEVEL SECURITY;
            
            -- Only users with @sideby.ai emails can access logs
            DROP POLICY IF EXISTS "Allow admins to access journey logs" ON public.journey_reminder_logs;
            CREATE POLICY "Allow admins to access journey logs" 
              ON public.journey_reminder_logs
              USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid()
                  AND profiles.email LIKE '%@sideby.ai'
                )
              );
          `
        });
        if (createError) {
          console.error("Error creating journey_reminder_logs table:", createError);
        }
      }
    } catch (logError) {
      console.error("Error with logs table:", logError);
    }
    // If initialize is set, create default data
    if (initialize) {
      // First check if data already exists
      const { data: configsData, error: configsError } = await supabase.from('journey_stage_config').select('*');
      if (configsError) {
        console.error("Error checking for existing configs:", configsError);
      }
      if (!configsData || configsData.length === 0) {
        await createDefaultData(supabase);
      }
    }
    // Check if tables exist now
    const configExists = await checkTableExists(supabase, 'journey_stage_config');
    const templatesExists = await checkTableExists(supabase, 'journey_reminder_templates');
    const logsExists = await checkTableExists(supabase, 'journey_reminder_logs');
    return new Response(JSON.stringify({
      success: true,
      tablesCreated: {
        config: configExists,
        templates: templatesExists,
        logs: logsExists
      },
      initialize
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Error in create-journey-tables:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
/**
 * Helper function to check if a table exists in the database
 */ async function checkTableExists(supabase, tableName) {
  try {
    const { error } = await supabase.from(tableName).select('id', {
      count: 'exact',
      head: true
    }).limit(1);
    return !error;
  } catch  {
    return false;
  }
}
/**
 * Creates default data for journey stages if none exists
 */ async function createDefaultData(supabase) {
  console.log("Creating default journey data");
  const stages = [
    'new',
    'reflection_completed',
    'matched',
    'scheduled',
    'conversation',
    'active'
  ];
  // Clear existing data if we're reinitializing
  try {
    await supabase.from('journey_stage_config').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('journey_reminder_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log("Cleared existing data");
  } catch (clearError) {
    console.error("Error clearing existing data:", clearError);
  // Continue anyway
  }
  // Create default config entries
  for (const stage of stages){
    try {
      // Insert config for this stage
      const { error: configError } = await supabase.from('journey_stage_config').insert({
        stage,
        reminder_times: {
          "24h": true,
          "48h": true,
          "weekly": stage === "matched" || stage === "conversation"
        },
        welcome_email_enabled: stage === "new" || stage === "matched",
        welcome_email_delay_hours: stage === "new" ? 0 : 24
      });
      if (configError) {
        console.error(`Error creating config for stage ${stage}:`, configError);
      }
      // Create default templates for this stage
      const commonTemplates = [
        {
          stage,
          reminder_type: "welcome",
          subject: `Welcome to the ${stage} stage`,
          content: `Welcome to the ${stage} stage of your sideby learning journey. We're excited to have you here!`,
          active: true,
          cta_text: "Get Started",
          cta_url: "/dashboard"
        },
        {
          stage,
          reminder_type: "24h",
          subject: `24-hour reminder for ${stage} stage`,
          content: `It's been 24 hours since you entered the ${stage} stage. Don't forget to continue your learning journey!`,
          active: true,
          cta_text: "Continue",
          cta_url: "/dashboard"
        },
        {
          stage,
          reminder_type: "48h",
          subject: `48-hour reminder for ${stage} stage`,
          content: `It's been 48 hours since you entered the ${stage} stage. Keep your momentum going!`,
          active: true,
          cta_text: "Continue",
          cta_url: "/dashboard"
        },
        {
          stage,
          reminder_type: "weekly",
          subject: `Weekly reminder for ${stage} stage`,
          content: `It's been a week since you entered the ${stage} stage. Let's keep learning together!`,
          active: stage === "matched" || stage === "conversation",
          cta_text: "Continue",
          cta_url: "/dashboard"
        }
      ];
      // Insert all templates for this stage
      for (const template of commonTemplates){
        const { error: templateError } = await supabase.from('journey_reminder_templates').insert(template);
        if (templateError) {
          console.error(`Error creating template for stage ${stage}:`, templateError);
        }
      }
    } catch (stageError) {
      console.error(`Error processing stage ${stage}:`, stageError);
    }
  }
  console.log("Default data creation complete");
}
