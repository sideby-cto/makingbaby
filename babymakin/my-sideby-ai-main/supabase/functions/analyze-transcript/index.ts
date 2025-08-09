import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { transcript, userId, isSecondOpinion = false, adminId } = await req.json();
    console.log('Received request with:');
    console.log('- Transcript present:', Boolean(transcript));
    console.log('- Transcript length:', transcript?.length || 0);
    console.log('- User ID:', userId || 'missing');
    console.log('- Is second opinion:', isSecondOpinion);
    console.log('- Admin ID:', adminId || 'missing');
    // Validate required fields
    if (!transcript) {
      throw new Error('Missing required field: transcript');
    }
    if (!userId) {
      throw new Error('Missing required field: userId');
    }
    if (!perplexityApiKey) {
      throw new Error('Missing Perplexity API key in environment variables');
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration in environment variables');
    }
    // Parse VTT and clean up the text
    const cleanedTranscript = parseVttTranscript(transcript);
    if (!cleanedTranscript || cleanedTranscript.trim().length === 0) {
      throw new Error('Transcript is empty after cleaning');
    }
    console.log('Cleaned transcript length:', cleanedTranscript.length);
    console.log('First 100 chars of cleaned transcript:', cleanedTranscript.substring(0, 100));
    // Prepare prompt based on analysis type
    const systemPrompt = prepareSystemPrompt(isSecondOpinion);
    console.log('Making request to Perplexity API...');
    try {
      // Call Perplexity API
      const aiResult = await callPerplexityApi(systemPrompt, cleanedTranscript, isSecondOpinion);
      console.log('Perplexity API response received');
      if (!aiResult.choices?.[0]?.message?.content) {
        console.error('Invalid Perplexity response structure:', JSON.stringify(aiResult));
        throw new Error('Invalid response from Perplexity API: Missing content');
      }
      // Parse and validate the analysis
      const analysis = parseAndValidateAnalysis(aiResult.choices[0].message.content, isSecondOpinion);
      // Handle previous experiments (soft delete)
      if (!isSecondOpinion) {
        await softDeletePreviousExperiments(userId, supabaseUrl, supabaseServiceKey);
      }
      // Store results in Supabase
      await storeExperimentResults(analysis, userId, cleanedTranscript, isSecondOpinion, adminId, supabaseUrl, supabaseServiceKey);
      return new Response(JSON.stringify(analysis), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error with AI analysis or database operations:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in analyze-transcript function:', error);
    return new Response(JSON.stringify({
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
/**
 * Parses a VTT transcript and returns a cleaned text version
 */ function parseVttTranscript(transcript) {
  const blocks = transcript.split('\n\n');
  console.log('Number of transcript blocks:', blocks.length);
  let currentSpeaker = '';
  const textBlocks = blocks.map((block)=>{
    const lines = block.split('\n');
    if (lines[0]?.includes('WEBVTT')) {
      return '';
    }
    const textLines = lines.filter((line)=>{
      if (!line.trim()) return false;
      if (line.match(/^\d{2}:\d{2}/) || line.includes('-->')) return false;
      if (line.includes(':')) {
        const [possibleSpeaker] = line.split(':');
        if (possibleSpeaker.trim().length > 0) {
          currentSpeaker = possibleSpeaker.trim();
        }
      }
      return true;
    });
    return textLines.map((line)=>{
      if (line.includes(':')) return line;
      return `${currentSpeaker}: ${line}`;
    }).join(' ');
  });
  return textBlocks.filter((block)=>block.trim().length > 0).join('\n').trim();
}
/**
 * Prepares the system prompt based on analysis type
 */ function prepareSystemPrompt(isSecondOpinion) {
  return isSecondOpinion ? `You are a different expert educational analyst who will provide a fresh perspective. Focus specifically on identifying alternative professional roles or identities that might not have been considered before. Look for unique combinations of skills and experiences that could suggest non-traditional roles.

Important: When suggesting hats/roles, always use NOUNS that describe the person rather than the activity. For example:
- Use "trumpet player" instead of "playing trumpet"
- Use "skier" instead of "skiing"
- Use "knitter" instead of "knitting"
- Use "researcher" instead of "researching"

Pay special attention to who is speaking in the transcript (indicated by "Speaker: text" format). Consider how different speakers express themselves and their unique perspectives.

Return ONLY raw JSON without any markdown formatting or code blocks. Return ONLY a valid JSON object with these exact fields (no additional text):
{
  "suggested_hats": ["role1", "role2"],
  "confidence_score": 0.8
}` : `You are an expert analyst focusing on surfacing patterns of excitement and caution in educational professionals' discussions. Your task is to identify areas where they show energy and enthusiasm, as well as areas where they express hesitation or concern.

Important: When suggesting hats/roles, always use NOUNS that describe the person rather than the activity. For example:
- Use "trumpet player" instead of "playing trumpet"
- Use "skier" instead of "skiing"
- Use "knitter" instead of "knitting"
- Use "researcher" instead of "researching"

Pay special attention to who is speaking (indicated by "Speaker: text" format). When analyzing excitement and caution areas, note which speaker expressed them. This will help provide more accurate and personalized insights.

Return ONLY raw JSON without any markdown formatting or code blocks. Return ONLY a valid JSON object with these exact fields (no additional text):
{
  "suggested_hats": ["role1", "role2"],
  "excitement_areas": ["Speaker Name - specific area of excitement", "Other Speaker - their area of excitement"],
  "caution_areas": ["Speaker Name - specific area of caution", "Other Speaker - their area of caution"],
  "moment_of_brilliance": "Speaker Name: quote from the transcript that captures a particularly insightful moment",
  "confidence_score": 0.8
}`;
}
/**
 * Calls the Perplexity API with the provided prompt and transcript
 */ async function callPerplexityApi(systemPrompt, cleanedTranscript, isSecondOpinion) {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-huge-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: cleanedTranscript
          }
        ],
        temperature: isSecondOpinion ? 0.7 : 0.2,
        max_tokens: 1000
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      throw new Error(`Perplexity API error: ${response.status}. Details: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in Perplexity API call:', error);
    throw error;
  }
}
/**
 * Parses and validates the analysis JSON
 */ function parseAndValidateAnalysis(content, isSecondOpinion) {
  try {
    // Clean markdown formatting if present
    let cleanContent = content.trim();
    console.log('Raw content from Perplexity:', cleanContent.substring(0, 150) + '...');
    if (cleanContent.includes('```')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    cleanContent = cleanContent.trim();
    console.log('Cleaned content before parsing:', cleanContent.substring(0, 150) + '...');
    let analysis;
    try {
      analysis = JSON.parse(cleanContent);
      console.log('Successfully parsed analysis JSON');
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Content that failed to parse:', cleanContent);
      // Create a default analysis if parsing fails
      analysis = isSecondOpinion ? {
        suggested_hats: [
          "Educational Consultant",
          "Curriculum Designer"
        ],
        confidence_score: 0.7
      } : {
        suggested_hats: [
          "Educational Consultant",
          "Curriculum Designer"
        ],
        excitement_areas: [],
        caution_areas: [],
        moment_of_brilliance: "",
        confidence_score: 0.7
      };
    }
    // Validate and set defaults for required fields
    if (isSecondOpinion) {
      if (!analysis.suggested_hats || !Array.isArray(analysis.suggested_hats)) {
        analysis.suggested_hats = [
          "Educational Consultant",
          "Curriculum Designer"
        ];
      }
      if (typeof analysis.confidence_score !== 'number') {
        analysis.confidence_score = 0.7;
      }
    } else {
      if (!analysis.suggested_hats || !Array.isArray(analysis.suggested_hats)) {
        analysis.suggested_hats = [
          "Educational Consultant",
          "Curriculum Designer"
        ];
      }
      if (!analysis.excitement_areas || !Array.isArray(analysis.excitement_areas)) {
        analysis.excitement_areas = [];
      }
      if (!analysis.caution_areas || !Array.isArray(analysis.caution_areas)) {
        analysis.caution_areas = [];
      }
      if (!analysis.moment_of_brilliance || typeof analysis.moment_of_brilliance !== 'string') {
        analysis.moment_of_brilliance = "";
      }
      if (typeof analysis.confidence_score !== 'number') {
        analysis.confidence_score = 0.7;
      }
    }
    return analysis;
  } catch (error) {
    console.error('Error parsing or validating analysis:', error);
    throw new Error(`Failed to parse or validate analysis: ${error.message}`);
  }
}
/**
 * Soft deletes previous experiments for this user
 */ async function softDeletePreviousExperiments(userId, supabaseUrl, supabaseServiceKey) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/profile_experiments?user_id=eq.${userId}&is_second_opinion=eq.false&experiment_type=eq.guts_vs_fear&is_deleted=eq.false`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        is_deleted: true
      })
    });
    if (!response.ok) {
      console.error('Failed to soft delete previous experiments:', await response.text());
    } else {
      console.log('Successfully soft-deleted previous experiments');
    }
  } catch (error) {
    console.error('Error soft deleting previous experiments:', error);
  // Continue with storing new experiment even if soft delete fails
  }
}
/**
 * Stores the experiment results in Supabase
 */ async function storeExperimentResults(analysis, userId, cleanedTranscript, isSecondOpinion, adminId, supabaseUrl, supabaseServiceKey) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/profile_experiments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        suggested_hats: analysis.suggested_hats,
        excitement_areas: analysis.excitement_areas || [],
        caution_areas: analysis.caution_areas || [],
        moment_of_brilliance: analysis.moment_of_brilliance || "",
        analyzed_transcript: cleanedTranscript,
        source_type: 'vtt_transcript',
        confidence_score: analysis.confidence_score || 0.7,
        is_second_opinion: isSecondOpinion,
        experiment_type: 'guts_vs_fear',
        created_by: adminId,
        is_deleted: false,
        status: 'active'
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to store analysis:', errorText);
      throw new Error(`Failed to store analysis: ${errorText}`);
    }
    console.log('Successfully stored experiment results');
  } catch (error) {
    console.error('Error storing experiment:', error);
    throw error;
  }
}
