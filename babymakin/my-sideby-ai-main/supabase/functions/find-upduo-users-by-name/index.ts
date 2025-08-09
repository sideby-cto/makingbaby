import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserSearchRequest {
  firstName: string;
  lastName: string;
  limit?: number;
}

interface MatchResult {
  sidebyUserId: string;
  sidebyFirstName: string;
  sidebyLastName: string;
  sidebyEmail: string;
  matchType: 'exact' | 'fuzzy';
  confidenceScore: number;
  hasExistingMapping: boolean;
  existingMapping?: {
    id: string;
    upduoUserId: string;
    upduoFirstName: string;
    upduoLastName: string;
  };
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
    const { firstName, lastName, limit = 10 }: UserSearchRequest = await req.json();

    console.log(`Searching for users matching: ${firstName} ${lastName}`);

    const results: MatchResult[] = [];

    // 1. First try exact name matching
    const { data: exactMatches } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .limit(limit);

    if (exactMatches) {
      for (const profile of exactMatches) {
        // Check if this user already has a mapping
        const { data: existingMapping } = await supabase
          .from('upduo_user_mappings')
          .select('id, upduo_user_id, upduo_first_name, upduo_last_name')
          .eq('sideby_user_id', profile.id)
          .maybeSingle();

        results.push({
          sidebyUserId: profile.id,
          sidebyFirstName: profile.first_name,
          sidebyLastName: profile.last_name,
          sidebyEmail: profile.email,
          matchType: 'exact',
          confidenceScore: 1.0,
          hasExistingMapping: !!existingMapping,
          existingMapping: existingMapping || undefined
        });
      }
    }

    // 2. If we didn't find enough exact matches, try fuzzy matching
    if (results.length < limit) {
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .not('first_name', 'is', null)
        .not('last_name', 'is', null);

      if (allProfiles) {
        const fuzzyMatches: Array<{ profile: any; score: number }> = [];

        for (const profile of allProfiles) {
          // Skip if already in exact matches
          if (results.some(r => r.sidebyUserId === profile.id)) continue;

          const firstNameSimilarity = calculateSimilarity(
            firstName.toLowerCase(),
            profile.first_name.toLowerCase()
          );
          const lastNameSimilarity = calculateSimilarity(
            lastName.toLowerCase(),
            profile.last_name.toLowerCase()
          );

          // Combined score with emphasis on last name
          const combinedScore = (firstNameSimilarity * 0.4) + (lastNameSimilarity * 0.6);

          // Only include high-confidence fuzzy matches
          if (combinedScore > 0.7) {
            fuzzyMatches.push({ profile, score: combinedScore });
          }
        }

        // Sort by score and take the best matches
        fuzzyMatches
          .sort((a, b) => b.score - a.score)
          .slice(0, limit - results.length)
          .forEach(async (match) => {
            // Check if this user already has a mapping
            const { data: existingMapping } = await supabase
              .from('upduo_user_mappings')
              .select('id, upduo_user_id, upduo_first_name, upduo_last_name')
              .eq('sideby_user_id', match.profile.id)
              .maybeSingle();

            results.push({
              sidebyUserId: match.profile.id,
              sidebyFirstName: match.profile.first_name,
              sidebyLastName: match.profile.last_name,
              sidebyEmail: match.profile.email,
              matchType: 'fuzzy',
              confidenceScore: Math.round(match.score * 100) / 100,
              hasExistingMapping: !!existingMapping,
              existingMapping: existingMapping || undefined
            });
          });
      }
    }

    console.log(`Found ${results.length} potential matches for ${firstName} ${lastName}`);

    return new Response(
      JSON.stringify({
        success: true,
        searchQuery: { firstName, lastName },
        matches: results,
        summary: {
          total: results.length,
          exactMatches: results.filter(r => r.matchType === 'exact').length,
          fuzzyMatches: results.filter(r => r.matchType === 'fuzzy').length,
          withExistingMappings: results.filter(r => r.hasExistingMapping).length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in find-upduo-users-by-name:', error);
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