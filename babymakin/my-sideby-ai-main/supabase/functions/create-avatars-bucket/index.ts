import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};
// Handle CORS preflight requests
function handleCors(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }
  return null;
}
serve(async (req)=>{
  // Handle CORS preflight requests first
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  try {
    // Create a Supabase client with the auth context
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(JSON.stringify({
        error: "No authorization header"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 401
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authorization
        }
      }
    });
    // Check if the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      throw bucketsError;
    }
    let bucketExists = false;
    let bucketId = "avatars";
    for (const bucket of buckets){
      if (bucket.name === bucketId) {
        bucketExists = true;
        break;
      }
    }
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketId, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp"
        ]
      });
      if (createError) {
        throw createError;
      }
      // Create storage policies for the bucket
      // Anyone can read images (public bucket)
      const { error: readPolicyError } = await supabase.rpc("create_storage_policy", {
        bucket_id: bucketId,
        policy_name: "Public Read Policy",
        definition: "true",
        operation: "SELECT"
      });
      if (readPolicyError) {
        console.error("Error creating read policy:", readPolicyError);
      }
      // Only authenticated users can upload their own avatars
      const { error: insertPolicyError } = await supabase.rpc("create_storage_policy", {
        bucket_id: bucketId,
        policy_name: "Auth Upload Policy",
        definition: "auth.uid() = (storage.foldername)[1]::uuid",
        operation: "INSERT"
      });
      if (insertPolicyError) {
        console.error("Error creating insert policy:", insertPolicyError);
      }
      // Users can only update their own avatars
      const { error: updatePolicyError } = await supabase.rpc("create_storage_policy", {
        bucket_id: bucketId,
        policy_name: "Auth Update Policy",
        definition: "auth.uid() = (storage.foldername)[1]::uuid",
        operation: "UPDATE"
      });
      if (updatePolicyError) {
        console.error("Error creating update policy:", updatePolicyError);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: bucketExists ? "Bucket already exists" : "Bucket created successfully",
      bucketId
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
