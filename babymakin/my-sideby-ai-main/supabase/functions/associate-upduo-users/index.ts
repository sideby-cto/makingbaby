import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssociationRequest {
  sessionId: string;
  upduoUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  forceAssociation?: boolean;
}

interface AssociationResult {
  upduoUserId: string;
  sidebyUserId?: string;
  associationMethod: string;
  confidenceScore: number;
  verified: boolean;
  isNew?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { sessionId, upduoUsers, forceAssociation = false }: AssociationRequest = await req.json();

    console.log(`Starting user association for session ${sessionId} with ${upduoUsers.length} users`);

    const results: AssociationResult[] = [];

    for (const upduoUser of upduoUsers) {
      console.log(`Processing Upduo user: ${upduoUser.firstName} ${upduoUser.lastName} (${upduoUser.id})`);
      
      let associationResult: AssociationResult = {
        upduoUserId: upduoUser.id,
        associationMethod: 'unmatched',
        confidenceScore: 0,
        verified: false
      };

      // 1. First check if we have an existing mapping
      const { data: existingMapping } = await supabase
        .from('upduo_user_mappings')
        .select('*')
        .eq('upduo_user_id', upduoUser.id)
        .maybeSingle();

      if (existingMapping) {
        console.log(`Found existing mapping for ${upduoUser.id} -> ${existingMapping.sideby_user_id}`);
        associationResult = {
          upduoUserId: upduoUser.id,
          sidebyUserId: existingMapping.sideby_user_id,
          associationMethod: 'existing_mapping',
          confidenceScore: existingMapping.confidence_score || 1.0,
          verified: existingMapping.verified || false
        };
      } else {
        // 2. Try exact name matching
        const nameMatchResult = await findByExactNameMatch(supabase, upduoUser);
        if (nameMatchResult) {
          console.log(`Found exact name match for ${upduoUser.firstName} ${upduoUser.lastName}`);
          associationResult = nameMatchResult;
        } else {
          // 3. Try fuzzy name matching
          const fuzzyMatchResult = await findByFuzzyNameMatch(supabase, upduoUser);
          if (fuzzyMatchResult) {
            console.log(`Found fuzzy name match for ${upduoUser.firstName} ${upduoUser.lastName}`);
            associationResult = fuzzyMatchResult;
          }
        }

        // Create mapping if we found a match or if force association is enabled
        if (associationResult.sidebyUserId || forceAssociation) {
          const { error: mappingError } = await supabase
            .from('upduo_user_mappings')
            .insert({
              sideby_user_id: associationResult.sidebyUserId,
              upduo_user_id: upduoUser.id,
              upduo_first_name: upduoUser.firstName,
              upduo_last_name: upduoUser.lastName,
              confidence_score: associationResult.confidenceScore,
              mapping_method: associationResult.associationMethod,
              verified: associationResult.verified
            });

          if (!mappingError) {
            associationResult.isNew = true;
            console.log(`Created new mapping for ${upduoUser.id}`);
          } else {
            console.error(`Failed to create mapping: ${mappingError.message}`);
          }
        }
      }

      // Create session association if we have a Sideby user
      if (associationResult.sidebyUserId) {
        const { error: sessionAssocError } = await supabase
          .from('upduo_session_associations')
          .upsert({
            session_id: sessionId,
            sideby_user_id: associationResult.sidebyUserId,
            upduo_user_id: upduoUser.id,
            association_method: associationResult.associationMethod,
            confidence_score: associationResult.confidenceScore,
            verified: associationResult.verified
          }, {
            onConflict: 'session_id,sideby_user_id'
          });

        if (sessionAssocError) {
          console.error(`Failed to create session association: ${sessionAssocError.message}`);
        }
      }

      results.push(associationResult);
    }

    console.log(`Completed association for session ${sessionId}. Results:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        associations: results,
        summary: {
          total: results.length,
          matched: results.filter(r => r.sidebyUserId).length,
          unmatched: results.filter(r => !r.sidebyUserId).length,
          newMappings: results.filter(r => r.isNew).length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in associate-upduo-users:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function findByExactNameMatch(supabase: any, upduoUser: any): Promise<AssociationResult | null> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .ilike('first_name', upduoUser.firstName)
    .ilike('last_name', upduoUser.lastName);

  if (profiles && profiles.length === 1) {
    return {
      upduoUserId: upduoUser.id,
      sidebyUserId: profiles[0].id,
      associationMethod: 'exact_name_match',
      confidenceScore: 0.95,
      verified: false
    };
  }

  return null;
}

async function findByFuzzyNameMatch(supabase: any, upduoUser: any): Promise<AssociationResult | null> {
  // Get all profiles and do fuzzy matching
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .not('first_name', 'is', null)
    .not('last_name', 'is', null);

  if (!profiles) return null;

  let bestMatch: any = null;
  let bestScore = 0;

  for (const profile of profiles) {
    const firstNameSimilarity = calculateSimilarity(
      upduoUser.firstName.toLowerCase(),
      profile.first_name.toLowerCase()
    );
    const lastNameSimilarity = calculateSimilarity(
      upduoUser.lastName.toLowerCase(),
      profile.last_name.toLowerCase()
    );

    // Combined score with emphasis on exact last name matches
    const combinedScore = (firstNameSimilarity * 0.4) + (lastNameSimilarity * 0.6);

    // Require high similarity for fuzzy matching
    if (combinedScore > 0.8 && combinedScore > bestScore) {
      bestScore = combinedScore;
      bestMatch = profile;
    }
  }

  if (bestMatch && bestScore > 0.8) {
    return {
      upduoUserId: upduoUser.id,
      sidebyUserId: bestMatch.id,
      associationMethod: 'fuzzy_name_match',
      confidenceScore: Math.round(bestScore * 100) / 100,
      verified: false
    };
  }

  return null;
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance implementation
  if (str1 === str2) return 1;
  
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  const distance = matrix[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  
  return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
}