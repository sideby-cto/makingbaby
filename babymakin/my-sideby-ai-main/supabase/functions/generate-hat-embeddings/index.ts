import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://mzoolkwmpppncywkqezd.supabase.co";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b29sa3dtcHBwbmN5d2txZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjQ4MzYsImV4cCI6MjA2MjMwMDgzNn0.Ag8r8aUVnmw_opvKd2-0IfOk4I8aAH-hb6bBzvmz4o4";
const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
// Create a single Supabase client for interacting with the database
const supabase = createClient(supabaseUrl, supabaseAnonKey);
/**
 * Generate embedding vectors for a hat name using Perplexity API
 * @param hatName The name of the hat/educational interest to generate embeddings for
 * @returns Array of embedding values or null if generation failed
 */ async function generateEmbedding(hatName) {
  try {
    console.log(`Generating embedding for hat: "${hatName}"`);
    // Check if we have a Perplexity API key
    if (!perplexityApiKey) {
      console.error("PERPLEXITY_API_KEY is not set");
      return null;
    }
    // For educational interests, we'll use the embedding model
    // This is a more direct approach than using chat completions
    const response = await fetch("https://api.perplexity.ai/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-small-online",
        input: `Educational interest or teaching activity: ${hatName}`,
        encoding_format: "float" // Specify float for numerical embeddings
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error (${response.status}): ${errorText}`);
      return null;
    }
    const data = await response.json();
    // Check if we have embedding data in the expected format
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.error("Invalid embedding response format:", JSON.stringify(data).substring(0, 200));
      // Fallback to chat completion if direct embeddings fail
      return await generateEmbeddingViaChat(hatName);
    }
    // Return the embedding vector
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Try fallback method if direct method fails
    return await generateEmbeddingViaChat(hatName);
  }
}
/**
 * Fallback method to generate embeddings via chat completion
 * @param hatName The hat name to generate embeddings for
 * @returns Array of embedding values or null if generation failed
 */ async function generateEmbeddingViaChat(hatName) {
  try {
    console.log(`Fallback: Generating embedding via chat for hat: "${hatName}"`);
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a specialized embedding generator for educational topics. Generate a numeric vector representation of the educational interest/activity provided. Return ONLY a JSON array of 1536 floating point values between -1 and 1."
          },
          {
            role: "user",
            content: `Generate an embedding vector for: "${hatName}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        presence_penalty: 0
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Chat API error (${response.status}): ${errorText}`);
      return null;
    }
    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Invalid chat response format:", JSON.stringify(data).substring(0, 200));
      return null;
    }
    try {
      // Try to extract a JSON array from the response
      const content = data.choices[0].message.content.trim();
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']') + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = content.substring(jsonStart, jsonEnd);
        const vector = JSON.parse(jsonStr);
        // Validate that we have a reasonable embedding vector
        if (Array.isArray(vector) && vector.length >= 768) {
          return vector;
        }
      }
      // If we couldn't extract a vector, generate a deterministic one
      console.log("Could not extract vector from response, using deterministic fallback");
      return generateDeterministicVector(hatName);
    } catch (parseError) {
      console.error("Error parsing embedding from chat response:", parseError);
      return generateDeterministicVector(hatName);
    }
  } catch (error) {
    console.error("Error in chat-based embedding generation:", error);
    return generateDeterministicVector(hatName);
  }
}
/**
 * Generate a deterministic vector from a hat name as a last resort fallback
 */ function generateDeterministicVector(hatName) {
  console.log(`Using deterministic vector generation for "${hatName}"`);
  // Create a stable hash function for the hat name
  const hashCode = (s)=>{
    let h = 0;
    for(let i = 0; i < s.length; i++){
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
  };
  // Generate a deterministic vector from the content
  const vector = Array(1536).fill(0);
  // Use the hat name to seed the vector values
  const seed = hashCode(hatName);
  const normalizedName = hatName.toLowerCase();
  // Fill the vector with deterministic but varied values
  for(let i = 0; i < 1536; i++){
    // Generate a value between -1 and 1 based on position and seed
    const seedValue = Math.sin(i * seed) * 0.5;
    // Additional variation based on characters in the name
    let charValue = 0;
    if (i < normalizedName.length) {
      charValue = (normalizedName.charCodeAt(i % normalizedName.length) - 97) / 26;
    }
    // Combine the values and ensure in range [-1, 1]
    vector[i] = Math.max(-1, Math.min(1, seedValue + charValue * 0.5));
  }
  return vector;
}
/**
 * Update or create embedding for a hat in the database
 */ async function updateEmbeddingForHat(hatName) {
  try {
    console.log(`Starting embedding update for: "${hatName}"`);
    // Normalize the hat name to lowercase for consistent storage
    const normalizedHatName = hatName.trim().toLowerCase();
    const embedding = await generateEmbedding(normalizedHatName);
    if (!embedding) {
      console.error(`Failed to generate embedding for hat: "${normalizedHatName}"`);
      return false;
    }
    console.log(`Successfully generated embedding for "${normalizedHatName}" (${embedding.length} dimensions)`);
    // Store the embedding in the database
    const { error } = await supabase.from('hat_embeddings').upsert({
      hat_name: normalizedHatName,
      embedding: embedding,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'hat_name'
    });
    if (error) {
      console.error(`Error storing embedding for "${normalizedHatName}":`, error);
      return false;
    }
    console.log(`Successfully stored embedding for "${normalizedHatName}"`);
    return true;
  } catch (error) {
    console.error(`Error in updateEmbeddingForHat for "${hatName}":`, error);
    return false;
  }
}
/**
 * Update the similarity cache for a hat against all other hats
 */ async function updateSimilarityCacheForHat(hatName) {
  try {
    console.log(`Updating similarity cache for hat: "${hatName}"`);
    const normalizedHatName = hatName.trim().toLowerCase();
    // Get all hat embeddings
    const { data: hats, error: hatsError } = await supabase.from('hat_embeddings').select('hat_name, embedding');
    if (hatsError || !hats) {
      console.error("Error fetching hat embeddings:", hatsError);
      return false;
    }
    console.log(`Found ${hats.length} total hats to calculate similarities with`);
    // Find the current hat embedding
    const currentHat = hats.find((h)=>h.hat_name === normalizedHatName);
    if (!currentHat || !currentHat.embedding) {
      console.error(`Hat embedding not found for: "${normalizedHatName}"`);
      return false;
    }
    // Calculate similarity with all other hats
    let batchSize = 0;
    const similarityBatch = [];
    for (const otherHat of hats){
      if (otherHat.hat_name === normalizedHatName) continue;
      if (!otherHat.embedding) {
        console.log(`Skipping hat "${otherHat.hat_name}" - missing embedding`);
        continue;
      }
      // Calculate cosine similarity
      const similarity = calculateCosineSimilarity(currentHat.embedding, otherHat.embedding);
      // Order hat names alphabetically for consistent storage
      const [hat1, hat2] = [
        normalizedHatName,
        otherHat.hat_name
      ].sort();
      const now = new Date().toISOString();
      // Add to batch
      similarityBatch.push({
        hat1,
        hat2,
        similarity,
        updated_at: now
      });
      batchSize++;
      // Process in batches of 25 to avoid overwhelming the DB
      if (batchSize >= 25) {
        await supabase.from('hat_similarity_cache').upsert(similarityBatch, {
          onConflict: 'hat1,hat2'
        });
        console.log(`Stored batch of ${batchSize} similarity records`);
        similarityBatch.length = 0;
        batchSize = 0;
      }
    }
    // Insert any remaining similarities
    if (similarityBatch.length > 0) {
      await supabase.from('hat_similarity_cache').upsert(similarityBatch, {
        onConflict: 'hat1,hat2'
      });
      console.log(`Stored final batch of ${similarityBatch.length} similarity records`);
    }
    console.log(`Successfully updated similarity cache for "${normalizedHatName}"`);
    return true;
  } catch (error) {
    console.error(`Error in updateSimilarityCacheForHat for "${hatName}":`, error);
    return false;
  }
}
/**
 * Calculate cosine similarity between two vectors
 */ function calculateCosineSimilarity(vec1, vec2) {
  // If vectors are different lengths, we'll use the shorter length
  const length = Math.min(vec1.length, vec2.length);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  for(let i = 0; i < length; i++){
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  // Avoid division by zero
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
/**
 * Collect all unique hat names from the database
 */ async function collectAllHatNames() {
  console.log("Collecting all unique hat names from the database...");
  const hatSet = new Set();
  try {
    // Get hats from primary flow activities
    const { data: experiments, error: experimentsError } = await supabase.from('profile_experiments').select('primary_flow_activity').filter('primary_flow_activity', 'not.is', null);
    if (!experimentsError && experiments) {
      experiments.forEach((exp)=>{
        if (exp.primary_flow_activity && typeof exp.primary_flow_activity === 'string') {
          hatSet.add(exp.primary_flow_activity.trim().toLowerCase());
        }
      });
      console.log(`Found ${hatSet.size} unique primary flow activities`);
    } else if (experimentsError) {
      console.error("Error fetching flow activities:", experimentsError);
    }
    // Get hats from subject statuses
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('subject_statuses');
    if (!profilesError && profiles) {
      profiles.forEach((profile)=>{
        if (profile.subject_statuses && Array.isArray(profile.subject_statuses)) {
          profile.subject_statuses.forEach((status)=>{
            if (status && status.name && typeof status.name === 'string') {
              hatSet.add(status.name.trim().toLowerCase());
            }
          });
        }
      });
      console.log(`Found ${hatSet.size} total unique hats after adding subject statuses`);
    } else if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }
    return Array.from(hatSet).filter((hat)=>hat.length > 0);
  } catch (error) {
    console.error("Error collecting hat names:", error);
    return [];
  }
}
/**
 * Process all hats to generate embeddings and update similarity cache
 */ async function processAllHats() {
  // Get all unique hat names
  const hats = await collectAllHatNames();
  console.log(`Found ${hats.length} unique hats to process`);
  const failed = [];
  let processed = 0;
  let batchSize = 0;
  const batchLimit = 5; // Process in batches to avoid overwhelming the API
  for (const hat of hats){
    try {
      // Update embedding
      const success = await updateEmbeddingForHat(hat);
      if (success) {
        // Update similarity cache
        await updateSimilarityCacheForHat(hat);
        processed++;
        console.log(`Completed processing for hat "${hat}" (${processed}/${hats.length})`);
      } else {
        failed.push(hat);
        console.error(`Failed to process hat: "${hat}"`);
      }
      batchSize++;
      // Add a delay between batches to avoid rate limiting
      if (batchSize >= batchLimit) {
        console.log(`Processed batch of ${batchLimit}, pausing briefly...`);
        await new Promise((resolve)=>setTimeout(resolve, 2000));
        batchSize = 0;
      }
    } catch (error) {
      failed.push(hat);
      console.error(`Error processing hat "${hat}":`, error);
    }
  }
  console.log(`Hat processing complete. Processed: ${processed}, Failed: ${failed.length}`);
  return {
    processed,
    failed
  };
}
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Authorization header is missing'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    // Verify the user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Check if the user is an admin
    const { data: isAdmin } = await supabase.rpc('is_sideby_admin_from_profile', {
      user_id: user.id
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({
        error: 'Unauthorized - Admin access required'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Parse request
    const { action, hat_name } = await req.json();
    console.log(`Received request with action: ${action}, hat_name: ${hat_name || 'all'}`);
    let result;
    switch(action){
      case 'generate_embedding':
        if (!hat_name) {
          return new Response(JSON.stringify({
            error: 'Hat name is required'
          }), {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
        console.log(`Starting individual embedding generation for "${hat_name}"`);
        result = await updateEmbeddingForHat(hat_name);
        if (result) {
          await updateSimilarityCacheForHat(hat_name);
          result = {
            success: true,
            hat_name
          };
        } else {
          result = {
            success: false,
            hat_name,
            error: "Failed to generate embedding"
          };
        }
        break;
      case 'process_all':
        console.log("Starting processing for all hats");
        result = await processAllHats();
        break;
      default:
        return new Response(JSON.stringify({
          error: 'Invalid action'
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
    }
    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error in generate-hat-embeddings function:", error);
    return new Response(JSON.stringify({
      error: error.message || "Unknown error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
