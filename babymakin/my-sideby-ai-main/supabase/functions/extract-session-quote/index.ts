import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { transcript, sessionType = 'peer-learning' } = await req.json();

    if (!transcript) {
      throw new Error('Transcript is required');
    }

    console.log('Processing transcript for quote extraction, session type:', sessionType);

    // Convert transcript to text if it's structured data
    let transcriptText = '';
    if (typeof transcript === 'string') {
      transcriptText = transcript;
    } else if (Array.isArray(transcript)) {
      // Handle array of transcript entries (like Upduo format)
      transcriptText = transcript
        .map(item => {
          if (typeof item === 'string') return item;
          if (item.text) return `${item.speaker || 'Speaker'}: ${item.text}`;
          return JSON.stringify(item);
        })
        .join('\n');
    } else if (transcript.text) {
      transcriptText = transcript.text;
    } else {
      transcriptText = JSON.stringify(transcript);
    }

    // Truncate if too long (OpenAI has token limits)
    if (transcriptText.length > 8000) {
      transcriptText = transcriptText.substring(0, 8000) + '...';
    }

    // Create different prompts based on session type
    let systemPrompt = '';
    if (sessionType === 'reflection' || sessionType === 'SINGLE') {
      systemPrompt = `You are an expert at extracting meaningful quotes from personal reflection sessions. 

Your task is to find the most insightful, memorable, or powerful quote from this reflection transcript. Look for:
- Moments of personal insight or breakthrough
- Powerful realizations or "aha moments" 
- Meaningful reflections on learning or growth
- Inspiring or motivational statements
- Quotes that capture the essence of the reflection

Return ONLY the most impactful quote (1-2 sentences maximum) without any additional text or explanation. The quote should stand alone as meaningful and inspiring.`;
    } else {
      systemPrompt = `You are an expert at extracting memorable quotes from learning conversations. 

Your task is to find the most engaging, insightful, or memorable quote from this peer learning session transcript. Look for:
- Moments of shared insight or "aha moments"
- Funny or engaging exchanges that made learning enjoyable
- Powerful statements about the subject matter
- Inspiring or thought-provoking discussion points
- Quotes that capture the collaborative spirit of learning
- Something that could be a "chorus to sing along to" - memorable and engaging

Return ONLY the most memorable quote (1-2 sentences maximum) without any additional text or explanation. The quote should capture the spirit of collaborative learning.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract the most meaningful quote from this ${sessionType} session:\n\n${transcriptText}` }
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const extractedQuote = data.choices[0].message.content.trim();

    // Clean up the quote (remove quotes if they were added)
    const cleanQuote = extractedQuote.replace(/^["']|["']$/g, '');

    console.log('Successfully extracted quote:', cleanQuote);

    return new Response(JSON.stringify({ 
      quote: cleanQuote,
      sessionType: sessionType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-session-quote function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      quote: 'Unable to extract quote from this session.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});