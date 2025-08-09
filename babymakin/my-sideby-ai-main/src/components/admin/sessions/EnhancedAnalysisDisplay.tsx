
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, MessageSquare, TrendingUp, Lightbulb, User } from "lucide-react";
import { EnhancedAnalysis } from "@/hooks/useEnhancedTranscriptAnalysis";

interface EnhancedAnalysisDisplayProps {
  analysis: EnhancedAnalysis;
}

export function EnhancedAnalysisDisplay({ analysis }: EnhancedAnalysisDisplayProps) {
  const getEmotionColor = (emotion: string) => {
    const colors = {
      curious: "bg-blue-100 text-blue-800",
      excited: "bg-yellow-100 text-yellow-800",
      frustrated: "bg-red-100 text-red-800",
      confident: "bg-green-100 text-green-800",
      uncertain: "bg-gray-100 text-gray-800",
      engaged: "bg-purple-100 text-purple-800"
    };
    return colors[emotion as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getEnergyColor = (level: string) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500", 
      low: "bg-blue-500"
    };
    return colors[level as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="emotional" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="emotional" className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            Emotional
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            Topics
          </TabsTrigger>
          <TabsTrigger value="expertise" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Expertise
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="personality" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Personality
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emotional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Emotional Sentiment Analysis
              </CardTitle>
              <CardDescription>
                Understanding emotional patterns throughout the conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dominant Emotion</span>
                <Badge className={getEmotionColor(analysis.emotional_sentiment.dominant_emotion)}>
                  {analysis.emotional_sentiment.dominant_emotion}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence Level</span>
                  <span>{Math.round(analysis.emotional_sentiment.confidence * 100)}%</span>
                </div>
                <Progress value={analysis.emotional_sentiment.confidence * 100} className="h-2" />
              </div>

              {analysis.emotional_sentiment.emotional_arc && analysis.emotional_sentiment.emotional_arc.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Emotional Journey</h4>
                  <div className="space-y-1">
                    {analysis.emotional_sentiment.emotional_arc.map((point, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span>Time {Math.round(point.time)}min</span>
                        <Badge variant="outline" className={getEmotionColor(point.emotion)}>
                          {point.emotion}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Progress value={point.intensity * 100} className="h-1 w-12" />
                          <span>{Math.round(point.intensity * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Engagement Patterns
              </CardTitle>
              <CardDescription>
                Analysis of participation and interaction patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Speaking Ratio</span>
                  <Progress value={analysis.engagement_patterns.speaking_ratio * 100} className="h-2" />
                  <span className="text-xs text-gray-600">
                    {Math.round(analysis.engagement_patterns.speaking_ratio * 100)}% of conversation
                  </span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Energy Level</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-full rounded ${getEnergyColor(analysis.engagement_patterns.energy_level)}`} />
                    <Badge variant="outline">{analysis.engagement_patterns.energy_level}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{analysis.engagement_patterns.question_frequency.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">Questions/min</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{analysis.engagement_patterns.interruption_count}</div>
                  <div className="text-xs text-gray-600">Interruptions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Semantic Topics
              </CardTitle>
              <CardDescription>
                Key topics and concepts identified with semantic understanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.semantic_topics.map((topic, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{topic.topic}</h4>
                      <Badge variant="secondary">{Math.round(topic.confidence * 100)}%</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {topic.context_keywords.map((keyword, kidx) => (
                        <Badge key={kidx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expertise" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Expertise Indicators
              </CardTitle>
              <CardDescription>
                Areas where the user demonstrated knowledge or expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.expertise_indicators.map((expertise, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{expertise.domain}</h4>
                      <Badge variant="default">{Math.round(expertise.confidence * 100)}%</Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-600">Evidence:</span>
                      <ul className="list-disc list-inside space-y-1">
                        {expertise.evidence.map((evidence, eidx) => (
                          <li key={eidx} className="text-sm text-gray-700">"{evidence}"</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Learning Moments
              </CardTitle>
              <CardDescription>
                Key learning insights, breakthroughs, and moments of discovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.learning_moments.map((moment, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{moment.type}</Badge>
                      <span className="text-xs text-gray-500">~{moment.timestamp}min</span>
                    </div>
                    
                    <p className="text-sm">{moment.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Significance:</span>
                      <Progress value={moment.significance * 100} className="h-1 flex-1" />
                      <span className="text-xs">{Math.round(moment.significance * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personality Insights
              </CardTitle>
              <CardDescription>
                Communication and learning style patterns observed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Communication Style</span>
                  <Badge>{analysis.personality_traits.communication_style}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Learning Preference</span>
                  <Badge variant="secondary">{analysis.personality_traits.learning_preference}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Collaboration Approach</span>
                  <Badge variant="outline">{analysis.personality_traits.collaboration_approach}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
