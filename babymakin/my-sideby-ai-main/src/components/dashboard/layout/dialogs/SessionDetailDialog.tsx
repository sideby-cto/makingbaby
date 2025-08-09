import React, { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, BookOpen, MessageSquare, Brain, Quote, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SessionDetailDialogProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  sessions: any[];
}

export const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({
  sessionId,
  isOpen,
  onClose,
  sessions
}) => {
  const [extractedQuote, setExtractedQuote] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const session = useMemo(() => {
    return sessions.find(s => s.id === sessionId);
  }, [sessions, sessionId]);

  // Extract quote when session changes and has transcript
  useEffect(() => {
    console.log('SessionDetailDialog useEffect triggered:', { 
      sessionId: session?.id, 
      hasTranscript: session?.hasTranscript, 
      isOpen,
      sessionType: session?.type,
      source: session?.source 
    });

    if (!session || !session.hasTranscript || !isOpen) {
      setExtractedQuote(null);
      setQuoteError(null);
      return;
    }

    const extractQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      
      try {
        const transcriptData = session.source === 'upduo' 
          ? session.data?.transcriptContents 
          : session.data?.transcript;

        console.log('SessionDetailDialog - Transcript data:', { 
          source: session.source, 
          hasData: !!transcriptData,
          dataType: typeof transcriptData,
          dataLength: Array.isArray(transcriptData) ? transcriptData.length : 'not array'
        });

        if (!transcriptData) {
          throw new Error('No transcript data available');
        }

        console.log('SessionDetailDialog - Calling extract-session-quote function...');

        const { data, error } = await supabase.functions.invoke('extract-session-quote', {
          body: {
            transcript: transcriptData,
            sessionType: session.type
          }
        });

        console.log('SessionDetailDialog - Function response:', { data, error });

        if (error) throw error;

        setExtractedQuote(data.quote);
      } catch (err) {
        console.error('Error extracting quote:', err);
        setQuoteError(err.message || 'Failed to extract quote');
        setExtractedQuote('Unable to extract a meaningful quote from this session.');
      } finally {
        setQuoteLoading(false);
      }
    };

    extractQuote();
  }, [session, isOpen]);

  if (!session) {
    return null;
  }

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
        return 'Reflection Session';
      case 'peer-learning':
      case 'PAIR':
        return 'Peer Learning Session';
      default:
        return type;
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration} seconds`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}${seconds > 0 ? ` ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
  };

  const renderSessionQuote = () => {
    if (!session.hasTranscript) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No transcript available for quote extraction</p>
        </div>
      );
    }

    if (quoteLoading) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Extracting meaningful quote...</span>
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }

    if (quoteError) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm text-red-500">{quoteError}</p>
        </div>
      );
    }

    const quoteTypeLabel = session.type === 'reflection' || session.type === 'SINGLE' 
      ? 'Reflection Insight' 
      : 'Session Highlight';

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>{quoteTypeLabel}</span>
        </div>
        
        <blockquote className="border-l-4 border-primary pl-6 py-4 bg-muted/30 rounded-r-lg">
          <Quote className="h-6 w-6 text-primary mb-2 opacity-70" />
          <p className="text-lg leading-relaxed italic text-foreground">
            "{extractedQuote}"
          </p>
        </blockquote>
        
        <p className="text-xs text-muted-foreground text-center">
          AI-extracted from session transcript • {session.type === 'reflection' ? 'Personal insight' : 'Collaborative learning moment'}
        </p>
      </div>
    );
  };

  const renderSessionMetrics = () => {
    if (session.source === 'upduo' && session.data?.metrics) {
      const metrics = session.data.metrics;
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Session Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {metrics.word_count || 0}
                </div>
                <div className="text-sm text-muted-foreground">Words Spoken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {metrics.question_count || 0}
                </div>
                <div className="text-sm text-muted-foreground">Questions Asked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatDuration(metrics.total_duration || session.duration)}
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {session.data.users?.length || 1}
                </div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
            </div>

            {metrics.sentiment_indicators && (
              <div>
                <h4 className="font-medium mb-2">Sentiment Analysis</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {Math.round(metrics.sentiment_indicators.positive * 100)}%
                    </div>
                    <div className="text-xs text-green-600">Positive</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="text-lg font-bold text-yellow-600">
                      {Math.round(metrics.sentiment_indicators.neutral * 100)}%
                    </div>
                    <div className="text-xs text-yellow-600">Neutral</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {Math.round(metrics.sentiment_indicators.negative * 100)}%
                    </div>
                    <div className="text-xs text-red-600">Negative</div>
                  </div>
                </div>
              </div>
            )}

            {metrics.learning_indicators && metrics.learning_indicators.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Learning Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  {metrics.learning_indicators.map((indicator: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (session.source === 'transcript') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Reflection Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {session.wordCount && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {session.wordCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
              )}
              {session.qualityScore && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(session.qualityScore * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Quality Score</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatDuration(session.duration)}
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{session.title}</DialogTitle>
            <Badge 
              variant="secondary" 
              className={cn("text-sm", getSessionTypeColor(session.type))}
            >
              {getSessionTypeLabel(session.type)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {session.date.toLocaleDateString()} at {session.date.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(session.duration)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {session.participants}
            </div>
            {session.hasTranscript && (
              <Badge variant="outline" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                Transcript Available
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-6">
            {/* Session Metrics */}
            {renderSessionMetrics()}

            {/* Knowledge Nodes (for Upduo sessions) */}
            {session.source === 'upduo' && session.data?.knowledgeNodes && session.data.knowledgeNodes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Topics Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {session.data.knowledgeNodes.map((node: any, index: number) => (
                      <Badge key={index} variant="outline">
                        {node.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Quote */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5" />
                  Session Quote
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderSessionQuote()}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};