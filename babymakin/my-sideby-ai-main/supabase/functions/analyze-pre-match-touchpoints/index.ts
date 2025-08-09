
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TouchpointAnalysisRequest {
  user1Id: string;
  user2Id: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  teaching_experience?: string;
  subjects?: string[];
  primary_flow_activity?: string;
  location?: any;
}

interface TranscriptRecord {
  id: string;
  transcript: any;
  metadata: any;
  created_at: string;
  word_count: number;
  quality_score: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user1Id, user2Id }: TouchpointAnalysisRequest = await req.json();

    console.log(`Analyzing pre-match touchpoints for users: ${user1Id} and ${user2Id}`);

    // Fetch both user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        bio,
        teaching_experience,
        subjects,
        primary_flow_activity,
        location
      `)
      .in('id', [user1Id, user2Id]);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }

    if (!profiles || profiles.length !== 2) {
      throw new Error('Could not fetch both user profiles');
    }

    const user1 = profiles.find(p => p.id === user1Id);
    const user2 = profiles.find(p => p.id === user2Id);

    if (!user1 || !user2) {
      throw new Error('Could not find both users in the results');
    }

    // Fetch transcripts for both users
    console.log('Fetching transcripts for analysis...');
    const { data: transcripts, error: transcriptError } = await supabase
      .from('upduo_transcripts')
      .select('id, transcript, metadata, created_at, user_id, word_count, quality_score')
      .in('user_id', [user1Id, user2Id])
      .order('created_at', { ascending: false })
      .limit(10);

    if (transcriptError) {
      console.warn('Error fetching transcripts:', transcriptError);
    }

    console.log(`Found ${transcripts?.length || 0} total transcripts`);

    const user1Transcripts = transcripts?.filter(t => t.user_id === user1Id) || [];
    const user2Transcripts = transcripts?.filter(t => t.user_id === user2Id) || [];

    console.log(`User1 (${user1.first_name}) transcripts: ${user1Transcripts.length}`);
    console.log(`User2 (${user2.first_name}) transcripts: ${user2Transcripts.length}`);

    // Use stored word counts (now that they're fixed) but validate with content analysis
    const getTranscriptContent = (transcript: any) => {
      if (!transcript) return '';
      
      if (typeof transcript === 'string') {
        try {
          const parsed = JSON.parse(transcript);
          if (Array.isArray(parsed)) {
            return parsed.map(entry => entry.text || '').join(' ');
          }
          return transcript;
        } catch {
          return transcript;
        }
      }
      
      if (Array.isArray(transcript)) {
        return transcript.map(entry => entry.text || '').join(' ');
      }
      
      return '';
    };

    const user1TranscriptContent = user1Transcripts.map(t => getTranscriptContent(t.transcript));
    const user2TranscriptContent = user2Transcripts.map(t => getTranscriptContent(t.transcript));

    // Use stored word counts (which are now accurate)
    const user1StoredWords = user1Transcripts.reduce((sum, t) => sum + (t.word_count || 0), 0);
    const user2StoredWords = user2Transcripts.reduce((sum, t) => sum + (t.word_count || 0), 0);

    console.log(`User1 word count: ${user1StoredWords}, User2 word count: ${user2StoredWords}`);

    // Extract topics from transcript content and metadata
    const extractTopicsFromTranscripts = (transcripts: any[], contentArray: string[]) => {
      const topics = new Set<string>();
      
      // Extract from metadata
      transcripts.forEach(t => {
        if (t.metadata?.session_topics) {
          t.metadata.session_topics.forEach((topic: string) => topics.add(topic));
        }
        if (t.metadata?.session_title) {
          topics.add(t.metadata.session_title);
        }
        if (t.metadata?.knowledgeNodes) {
          t.metadata.knowledgeNodes.forEach((node: any) => {
            if (node.name) topics.add(node.name);
          });
        }
      });

      // Extract keywords from content
      contentArray.forEach(content => {
        if (content.length > 50) {
          const keywords = content.toLowerCase()
            .split(/[.,!?;:\s]+/)
            .filter(word => word.length > 4 && !['that', 'this', 'with', 'they', 'have', 'been', 'were', 'said', 'what', 'when', 'where', 'about'].includes(word))
            .slice(0, 10);
          
          keywords.forEach(keyword => topics.add(keyword));
        }
      });

      return Array.from(topics);
    };

    const user1Topics = extractTopicsFromTranscripts(user1Transcripts, user1TranscriptContent);
    const user2Topics = extractTopicsFromTranscripts(user2Transcripts, user2TranscriptContent);

    console.log(`Extracted ${user1Topics.length} topics for user1, ${user2Topics.length} topics for user2`);

    // Analyze potential touchpoints
    const touchpoints = [];

    // Subject overlap analysis
    if (user1.subjects && user2.subjects) {
      const commonSubjects = user1.subjects.filter(subject => 
        user2.subjects.includes(subject)
      );
      if (commonSubjects.length > 0) {
        touchpoints.push({
          type: 'subject_overlap',
          title: 'Common Teaching Subjects',
          description: `Both teach: ${commonSubjects.join(', ')}`,
          strength: commonSubjects.length > 1 ? 'high' : 'medium'
        });
      }
    }

    // Flow activity analysis
    if (user1.primary_flow_activity && user2.primary_flow_activity) {
      if (user1.primary_flow_activity === user2.primary_flow_activity) {
        touchpoints.push({
          type: 'flow_activity',
          title: 'Shared Flow Activity',
          description: `Both find flow in: ${user1.primary_flow_activity}`,
          strength: 'high'
        });
      }
    }

    // Teaching experience analysis
    if (user1.teaching_experience && user2.teaching_experience) {
      touchpoints.push({
        type: 'teaching_experience',
        title: 'Teaching Experience Levels',
        description: `${user1.first_name}: ${user1.teaching_experience}, ${user2.first_name}: ${user2.teaching_experience}`,
        strength: 'medium'
      });
    }

    // Location analysis
    if (user1.location && user2.location) {
      touchpoints.push({
        type: 'location',
        title: 'Location Awareness',
        description: 'Both have location information available',
        strength: 'low'
      });
    }

    // Transcript-based analysis using corrected word counts
    if (user1Transcripts.length > 0 && user2Transcripts.length > 0) {
      // Find common topics
      const commonTopics = user1Topics.filter(topic => 
        user2Topics.some(t2 => t2.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(t2.toLowerCase()))
      );
      
      if (commonTopics.length > 0) {
        touchpoints.push({
          type: 'transcript_topics',
          title: 'Common Discussion Topics',
          description: `Both have discussed: ${commonTopics.slice(0, 3).join(', ')}`,
          strength: commonTopics.length > 2 ? 'high' : 'medium'
        });
      }

      // Check for substantial content using corrected word counts
      const user1HasContent = user1StoredWords > 20;
      const user2HasContent = user2StoredWords > 20;

      if (user1HasContent && user2HasContent) {
        touchpoints.push({
          type: 'transcript_activity',
          title: 'Active Reflection Participants',
          description: `${user1.first_name} has ${user1Transcripts.length} sessions (${user1StoredWords} words), ${user2.first_name} has ${user2Transcripts.length} sessions (${user2StoredWords} words)`,
          strength: 'high'
        });
      } else if (user1HasContent || user2HasContent) {
        const activeUser = user1HasContent ? user1.first_name : user2.first_name;
        const sessionCount = user1HasContent ? user1Transcripts.length : user2Transcripts.length;
        const wordCount = user1HasContent ? user1StoredWords : user2StoredWords;
        
        touchpoints.push({
          type: 'transcript_activity',
          title: 'Mixed Reflection Activity',
          description: `${activeUser} has ${sessionCount} reflection sessions (${wordCount} words)`,
          strength: 'medium'
        });
      }
    } else if (user1Transcripts.length > 0 || user2Transcripts.length > 0) {
      const activeUser = user1Transcripts.length > 0 ? user1.first_name : user2.first_name;
      const sessionCount = user1Transcripts.length > 0 ? user1Transcripts.length : user2Transcripts.length;
      const wordCount = user1Transcripts.length > 0 ? user1StoredWords : user2StoredWords;
      
      touchpoints.push({
        type: 'transcript_activity',
        title: 'Single User Reflection Activity',
        description: `${activeUser} has ${sessionCount} reflection sessions (${wordCount} words)`,
        strength: 'low'
      });
    }

    // Generate conversation starters based on touchpoints
    const conversationStarters = [];

    if (touchpoints.find(t => t.type === 'subject_overlap')) {
      conversationStarters.push(
        "What's your favorite approach to teaching your shared subjects?",
        "Have you discovered any innovative methods for engaging students in these areas?"
      );
    }

    if (touchpoints.find(t => t.type === 'flow_activity')) {
      conversationStarters.push(
        "How did you discover this flow activity?",
        "What specific aspects of this activity create flow for you?"
      );
    }

    if (touchpoints.find(t => t.type === 'transcript_topics')) {
      conversationStarters.push(
        "I noticed you've both reflected on similar topics - what insights have you gained?",
        "How has your perspective evolved through your reflection sessions?"
      );
    }

    conversationStarters.push(
      "What's the most rewarding part of your teaching journey so far?",
      "If you could change one thing about education, what would it be?"
    );

    const analysis = {
      touchpoints,
      conversationStarters: conversationStarters.slice(0, 4),
      compatibility: touchpoints.length > 2 ? 'high' : touchpoints.length > 0 ? 'medium' : 'low',
      summary: `Found ${touchpoints.length} potential connection points between ${user1.first_name} and ${user2.first_name}. Analysis includes ${user1Transcripts.length + user2Transcripts.length} reflection sessions.`,
      transcriptData: {
        user1: {
          name: user1.first_name,
          transcriptCount: user1Transcripts.length,
          recentTopics: user1Topics.slice(0, 5)
        },
        user2: {
          name: user2.first_name,
          transcriptCount: user2Transcripts.length,
          recentTopics: user2Topics.slice(0, 5)
        }
      }
    };

    console.log(`Pre-match analysis completed with ${touchpoints.length} touchpoints`);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in pre-match analysis:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to analyze pre-match touchpoints' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
