import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
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
    const { postId, readerId } = await req.json();
    if (!postId || !readerId) {
      throw new Error('Missing required parameters: postId or readerId');
    }
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Fetch the post and its author's posts with better error handling
    const { data: post, error: postError } = await supabase.from('posts').select(`
        content,
        profiles (
          first_name,
          last_name
        )
      `).eq('id', postId).maybeSingle();
    if (postError) {
      console.error('Error fetching post:', postError);
      throw new Error('Failed to fetch post');
    }
    if (!post || !post.content) {
      throw new Error('Post not found or has no content');
    }
    // Fetch reader's posts to analyze their style
    const { data: readerPosts, error: readerError } = await supabase.from('posts').select('content').eq('user_id', readerId).limit(5);
    if (readerError) {
      console.error('Error fetching reader posts:', readerError);
      throw new Error('Failed to fetch reader posts');
    }
    const readerCorpus = readerPosts?.map((p)=>p.content).join('\n') || '';
    console.log('Making OpenAI request with post content:', post.content);
    console.log('Reader corpus:', readerCorpus);
    // Call OpenAI API for translation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an expert at adapting text to match different writing styles. 
                     Analyze the following writing samples and then translate the target text 
                     to match the style of the reader's writing. Maintain the same meaning 
                     but adapt vocabulary, sentence structure, and tone.`
          },
          {
            role: 'user',
            content: `Reader's writing style examples:\n${readerCorpus}\n\nText to translate:\n${post.content}`
          }
        ]
      })
    });
    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to get translation from OpenAI');
    }
    const translation = await response.json();
    console.log('Translation completed:', translation);
    return new Response(JSON.stringify({
      original: post.content,
      translated: translation.choices[0].message.content,
      author: post.profiles ? `${post.profiles.first_name} ${post.profiles.last_name}` : 'Unknown'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in microtranslate function:', error);
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
