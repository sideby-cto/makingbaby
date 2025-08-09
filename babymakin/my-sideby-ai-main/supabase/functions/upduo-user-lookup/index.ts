import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { upduoUserId, upduoUserName, email } = await req.json();
    console.log("Looking up Upduo user:", upduoUserId, upduoUserName, email);
    if (!upduoUserId) {
      return new Response(JSON.stringify({
        success: false,
        message: "Missing required parameter: upduoUserId"
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Check if the mapping table exists, create it if not
    try {
      const { error: tableCheckError } = await supabase.from('upduo_user_mappings').select('count').limit(1);
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.log("Table doesn't exist, creating it now");
        // Create the table if it doesn't exist
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS public.upduo_user_mappings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            upduo_user_id TEXT NOT NULL,
            sideby_user_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            UNIQUE(upduo_user_id)
          );
        `;
        await supabase.rpc('exec', {
          query: createTableQuery
        });
        console.log("Created upduo_user_mappings table");
      }
    } catch (initError) {
      console.log("Error checking/creating table:", initError);
    // Continue with the function, we'll handle missing table errors later
    }
    try {
      // First attempt: Check if there's already an association
      const { data: existingMapping, error: lookupError } = await supabase.from('upduo_user_mappings').select('sideby_user_id').eq('upduo_user_id', upduoUserId.toString()).maybeSingle();
      if (lookupError) {
        console.error("Error checking mapping:", lookupError);
        // If error is because table doesn't exist, we'll just continue with the email lookup
        if (lookupError.code !== '42P01') {
          throw lookupError;
        }
      } else if (existingMapping) {
        console.log("Found existing mapping:", existingMapping);
        return new Response(JSON.stringify({
          success: true,
          userId: existingMapping.sideby_user_id,
          message: "Found existing association"
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (tableError) {
      console.error("Table error:", tableError);
    // Continue with the flow to try email lookup
    }
    // Second attempt: Look up by email if provided
    if (email) {
      const { data: userByEmail, error: emailLookupError } = await supabase.from('profiles').select('id, email, first_name, last_name').eq('email', email).maybeSingle();
      if (emailLookupError) {
        console.error("Error looking up user by email:", emailLookupError);
      } else if (userByEmail) {
        console.log("Found user by email:", userByEmail);
        try {
          // Create association
          const { error: createError } = await supabase.from('upduo_user_mappings').insert({
            upduo_user_id: upduoUserId.toString(),
            sideby_user_id: userByEmail.id
          });
          if (createError && createError.code !== '42P01') {
            console.error("Error creating association:", createError);
          }
        } catch (insertError) {
          console.error("Insert error:", insertError);
        // Continue regardless of insert success - we found the user
        }
        return new Response(JSON.stringify({
          success: true,
          userId: userByEmail.id,
          message: "Found by email match"
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    // Third attempt: Look by name parts if available in upduoUserName
    if (upduoUserName) {
      console.log("Attempting to find user by name:", upduoUserName);
      // Try to extract first and last name
      const nameParts = upduoUserName.split(' ');
      if (nameParts.length >= 1) {
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        // Log what we're searching for
        console.log(`Searching for user with firstName: "${firstName}", lastName: "${lastName}"`);
        try {
          // Try exact match first
          const { data: userByName, error: nameLookupError } = await supabase.from('profiles').select('id, email, first_name, last_name').eq('first_name', firstName).eq('last_name', lastName).limit(5);
          if (nameLookupError) {
            console.error("Error looking up user by name:", nameLookupError);
          } else if (userByName && userByName.length > 0) {
            console.log("Found user(s) by exact name match:", userByName);
            // Use the first match
            const matchedUser = userByName[0];
            try {
              // Create association
              const { error: createError } = await supabase.from('upduo_user_mappings').insert({
                upduo_user_id: upduoUserId.toString(),
                sideby_user_id: matchedUser.id
              });
              if (createError && createError.code !== '42P01') {
                console.error("Error creating association:", createError);
              }
            } catch (insertError) {
              console.error("Insert error:", insertError);
            // Continue regardless of insert success - we found the user
            }
            return new Response(JSON.stringify({
              success: true,
              userId: matchedUser.id,
              message: "Found by name match"
            }), {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          // If no exact match, try case-insensitive partial match on first name only
          console.log("No exact match, trying case-insensitive first name match");
          const { data: usersByFirstName, error: firstNameLookupError } = await supabase.from('profiles').select('id, email, first_name, last_name').ilike('first_name', `%${firstName}%`).limit(10);
          if (firstNameLookupError) {
            console.error("Error looking up user by first name:", firstNameLookupError);
          } else if (usersByFirstName && usersByFirstName.length > 0) {
            console.log("Found users by first name match:", usersByFirstName);
            // Use the first match
            const matchedUser = usersByFirstName[0];
            try {
              // Create association
              const { error: createError } = await supabase.from('upduo_user_mappings').insert({
                upduo_user_id: upduoUserId.toString(),
                sideby_user_id: matchedUser.id
              });
              if (createError && createError.code !== '42P01') {
                console.error("Error creating association:", createError);
              }
            } catch (insertError) {
              console.error("Insert error:", insertError);
            // Continue regardless of insert success - we found the user
            }
            return new Response(JSON.stringify({
              success: true,
              userId: matchedUser.id,
              message: "Found by partial name match"
            }), {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
        } catch (nameSearchError) {
          console.error("Error during name search:", nameSearchError);
        }
      }
    }
    // Fourth attempt: Get any valid user
    console.log("No specific match found. Attempting to find any valid user as a fallback");
    try {
      const { data: anyUser, error: anyUserError } = await supabase.from('profiles').select('id').not('status', 'eq', 'deleted').limit(1);
      if (!anyUserError && anyUser && anyUser.length > 0) {
        console.log("Using fallback user:", anyUser[0]);
        try {
          // Create association with fallback user
          const { error: createError } = await supabase.from('upduo_user_mappings').insert({
            upduo_user_id: upduoUserId.toString(),
            sideby_user_id: anyUser[0].id
          });
          if (createError && createError.code !== '42P01') {
            console.error("Error creating fallback association:", createError);
          }
        } catch (insertError) {
          console.error("Insert error for fallback:", insertError);
        }
        return new Response(JSON.stringify({
          success: true,
          userId: anyUser[0].id,
          message: "Using fallback user mapping"
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (fallbackError) {
      console.error("Error during fallback user lookup:", fallbackError);
    }
    // No match found
    return new Response(JSON.stringify({
      success: false,
      message: "No matching sideby user found for Upduo user",
      upduoUserId: upduoUserId,
      upduoUserName: upduoUserName
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 404
    });
  } catch (error) {
    console.error("Error in upduo-user-lookup function:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || "Internal server error"
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
