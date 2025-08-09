
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Users, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types/matchmaking';
import { useToast } from '@/hooks/use-toast';
import { TranscriptInfoDisplay } from './TranscriptInfoDisplay';

interface Touchpoint {
  type: string;
  title: string;
  description: string;
  strength: 'low' | 'medium' | 'high';
}

interface TranscriptData {
  user1: {
    name: string;
    transcriptCount: number;
    recentTopics: string[];
  };
  user2: {
    name: string;
    transcriptCount: number;
    recentTopics: string[];
  };
}

interface PreMatchAnalysis {
  touchpoints: Touchpoint[];
  conversationStarters: string[];
  compatibility: 'low' | 'medium' | 'high';
  summary: string;
  transcriptData?: TranscriptData;
}

interface PreMatchTouchpointAnalysisProps {
  user1: Profile;
  user2: Profile;
  onAnalysisComplete?: (analysis: PreMatchAnalysis) => void;
}

export const PreMatchTouchpointAnalysis: React.FC<PreMatchTouchpointAnalysisProps> = ({
  user1,
  user2,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<PreMatchAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-pre-match-touchpoints', {
        body: {
          user1Id: user1.id,
          user2Id: user2.id
        }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        setAnalysis(data.analysis);
        onAnalysisComplete?.(data.analysis);
        toast({
          title: "Analysis Complete",
          description: "Pre-match touchpoints have been analyzed successfully.",
        });
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error running pre-match analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze pre-match touchpoints. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="h-5 w-5" />
          Pre-Match Touchpoint Analysis
        </CardTitle>
        <p className="text-sm text-purple-700">
          Analyze potential connection points between {user1.first_name} and {user2.first_name}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-4">
            <Button 
              onClick={runAnalysis} 
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Match Potential
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Analysis Summary</h4>
                <Badge variant="outline" className={getCompatibilityColor(analysis.compatibility)}>
                  {analysis.compatibility.toUpperCase()} Compatibility
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{analysis.summary}</p>
            </div>

            {/* Transcript Information */}
            {analysis.transcriptData && (
              <TranscriptInfoDisplay transcriptData={analysis.transcriptData} />
            )}

            {/* Touchpoints */}
            {analysis.touchpoints.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Connection Points ({analysis.touchpoints.length})
                </h4>
                <div className="space-y-2">
                  {analysis.touchpoints.map((touchpoint, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm">{touchpoint.title}</h5>
                        <Badge className={`text-xs ${getStrengthColor(touchpoint.strength)}`}>
                          {touchpoint.strength}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{touchpoint.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Starters */}
            {analysis.conversationStarters.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Conversation Starters
                </h4>
                <div className="space-y-2">
                  {analysis.conversationStarters.map((starter, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{starter}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Re-analyze Button */}
            <div className="pt-2 border-t">
              <Button 
                onClick={runAnalysis} 
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Re-analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Re-analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
