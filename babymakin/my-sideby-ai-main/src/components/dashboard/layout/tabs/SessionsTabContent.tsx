import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Clock, Users, Eye, BookOpen, Quote } from "lucide-react";
import { useTranscripts, type TranscriptData } from "@/hooks/useTranscripts";
import { useUpduoSessions, type UpduoSession } from "@/hooks/useUpduoSessions";
import { useProfile } from "@/hooks/useProfile";
import { SessionDetailDialog } from "../dialogs/SessionDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SessionsTabContentProps {
  userId: string;
}

export const SessionsTabContent: React.FC<SessionsTabContentProps> = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionQuotes, setSessionQuotes] = useState<Record<string, string>>({});
  
  const { profile } = useProfile();
  const { data: transcripts, isLoading: transcriptsLoading } = useTranscripts(userId);
  const { sessions: upduoSessions, isLoading: sessionsLoading } = useUpduoSessions(50, true);

  // Helper function to format participant names as "First L."
  const formatParticipantName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length < 2) return fullName;
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstName} ${lastInitial}.`;
  };

  // Helper function to format multiple participants
  const formatParticipants = (participants: string) => {
    return participants.split(', ')
      .map(name => formatParticipantName(name))
      .join(', ');
  };

  // Helper function to check if current user participated in a session
  const userParticipatedInSession = (session: any) => {
    // Reflection sessions are always user-specific
    if (session.source === 'sideby') return true;
    
    // For UpDuo sessions, check if current user is in the participants
    if (session.source === 'upduo' && session.data?.users) {
      const currentUserEmail = profile?.email;
      const currentUserName = profile?.first_name && profile?.last_name 
        ? `${profile.first_name} ${profile.last_name}`.toLowerCase()
        : '';
      
      return session.data.users.some((user: any) => {
        // Match by email if available
        if (currentUserEmail && user.email && user.email.toLowerCase() === currentUserEmail.toLowerCase()) {
          return true;
        }
        
        // Match by name if available
        if (currentUserName && user.firstName && user.lastName) {
          const sessionUserName = `${user.firstName} ${user.lastName}`.toLowerCase();
          return sessionUserName === currentUserName;
        }
        
        return false;
      });
    }
    
    return false;
  };

  // Combine both data sources and normalize them (filtered for current user)
  const allSessions = useMemo(() => {
    const sessions: any[] = [];

    // Add Upduo sessions (only where user participated)
    if (upduoSessions) {
      upduoSessions.forEach(session => {
        const sessionData = {
          id: session.id,
          type: session.type || 'peer-learning',
          title: session.session_title || 
                 (session.knowledgeNodes?.length > 0 
                   ? session.knowledgeNodes.map(node => node.name).join(', ')
                   : 'Learning Session'),
          date: new Date(session.createdAt),
          duration: session.duration,
          participants: formatParticipants(session.users?.map(u => `${u.firstName} ${u.lastName}`).join(', ') || 'You'),
          hasTranscript: !!session.transcriptContents?.length,
          source: 'upduo',
          data: session
        };
        
        // Only add if current user participated
        if (userParticipatedInSession(sessionData)) {
          sessions.push(sessionData);
        }
      });
    }

    // Add individual transcripts (for reflection sessions without Upduo sessions)
    if (transcripts) {
      transcripts.forEach(transcript => {
        // Only add if not already represented by an Upduo session
        const isAlreadyAdded = sessions.some(s => 
          s.source === 'upduo' && s.data.id === transcript.conversation_id
        );
        
        if (!isAlreadyAdded) {
          sessions.push({
            id: transcript.id,
            type: 'reflection',
            title: 'Personal Reflection',
            date: new Date(transcript.created_at),
            duration: transcript.session_duration || 0,
            participants: formatParticipantName(profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'You'),
            hasTranscript: true,
            wordCount: transcript.word_count,
            qualityScore: transcript.quality_score,
            source: 'sideby',
            data: transcript
          });
        }
      });
    }

    return sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [upduoSessions, transcripts, profile]);

  // Extract quotes for sessions with transcripts
  useEffect(() => {
    const extractQuotesForSessions = async () => {
      const sessionsWithTranscripts = allSessions.filter(s => s.hasTranscript);
      
      for (const session of sessionsWithTranscripts) {
        // Skip if we already have a quote for this session
        if (sessionQuotes[session.id]) continue;
        
        try {
          const transcriptData = session.source === 'sideby' 
            ? session.data?.transcript_contents || session.data?.transcriptContents 
            : session.data?.transcriptContents;

          if (!transcriptData) continue;

          console.log('Extracting quote for session:', session.id, 'type:', session.type);

          const { data, error } = await supabase.functions.invoke('extract-session-quote', {
            body: {
              transcript: transcriptData,
              sessionType: session.type
            }
          });

          if (!error && data?.quote) {
            setSessionQuotes(prev => ({
              ...prev,
              [session.id]: data.quote
            }));
            console.log('Quote extracted for session:', session.id, data.quote);
          }
        } catch (error) {
          console.error('Error extracting quote for session:', session.id, error);
        }
      }
    };

    if (allSessions.length > 0) {
      extractQuotesForSessions();
    }
  }, [allSessions, sessionQuotes]);

  // Filter sessions based on search only
  const filteredSessions = useMemo(() => {
    return allSessions.filter(session => {
      const matchesSearch = !searchQuery || 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.participants.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [allSessions, searchQuery]);

  const isLoading = transcriptsLoading || sessionsLoading;

  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'reflection':
      case 'SINGLE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'peer-learning':
      case 'PAIR':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'reflection':
      case 'SINGLE':
        return 'Reflection';
      case 'peer-learning':
      case 'PAIR':
        return 'Peer Learning';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-classroom-text-primary">My Sessions & Reflections</h2>
          <p className="text-classroom-text-secondary">
            View and search through your learning sessions and reflections
          </p>
        </div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-classroom-text-secondary h-4 w-4" />
        <Input
          placeholder="Search sessions by title or participants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-classroom-text-secondary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-classroom-text-primary">No sessions found</h3>
              <p className="text-classroom-text-secondary">
                {searchQuery 
                  ? "Try adjusting your search"
                  : "Start a reflection session or connect with learning partners to see your sessions here"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      {session.hasTranscript && (
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Transcript
                        </Badge>
                      )}
                    </div>
                    
                    {/* Display extracted quote prominently */}
                    {sessionQuotes[session.id] && (
                      <div className="bg-classroom-surface rounded-lg p-3 border-l-4 border-classroom-orange">
                        <div className="flex items-start gap-2">
                          <Quote className="h-4 w-4 text-classroom-orange mt-0.5 flex-shrink-0" />
                          <p className="text-sm italic text-classroom-text-primary font-medium leading-relaxed">
                            "{sessionQuotes[session.id]}"
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-classroom-text-secondary flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {session.date.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(session.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.participants}
                      </div>
                      {session.wordCount && (
                        <div className="text-xs">
                          {session.wordCount} words
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSessionId(session.id)}
                    className="ml-4"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Session Detail Dialog */}
      <SessionDetailDialog
        sessionId={selectedSessionId}
        isOpen={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        sessions={allSessions}
      />
    </div>
  );
};