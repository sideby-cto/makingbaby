import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateStudentSuccessSign } from "@/hooks/useStudentSuccessSigns";
import { useAiSuggestionAnalysis } from "@/hooks/useAiSuccessAnalysis";
import { SIGN_TYPE_LABELS, SIGN_TYPE_DESCRIPTIONS, CONFIDENCE_LABELS } from "@/types/student-success";
import type { StudentSuccessSign, CreateStudentSuccessSign } from "@/types/student-success";
import { Brain, FileText, Lightbulb, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface EnhancedTranscriptSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  studentId: string;
  studentName: string;
  transcriptId?: string;
}

export const EnhancedTranscriptSuccessDialog = ({
  open,
  onOpenChange,
  selectedText,
  studentId,
  studentName,
  transcriptId
}: EnhancedTranscriptSuccessDialogProps) => {
  const [formData, setFormData] = useState<Partial<CreateStudentSuccessSign>>({
    student_id: studentId,
    transcript_id: transcriptId,
    sign_type: 'engagement',
    confidence_level: 3,
    detection_method: 'manual',
    evidence_text: selectedText
  });

  const createMutation = useCreateStudentSuccessSign();
  const aiSuggestionMutation = useAiSuggestionAnalysis();

  // Get AI suggestions when dialog opens or text changes
  useEffect(() => {
    if (selectedText && selectedText.length > 10) {
      aiSuggestionMutation.mutate({ selectedText });
    }
  }, [selectedText]);

  // Update form when AI suggestions arrive
  useEffect(() => {
    if (aiSuggestionMutation.data?.bestSuggestion) {
      const suggestion = aiSuggestionMutation.data.bestSuggestion;
      setFormData(prev => ({
        ...prev,
        sign_type: suggestion.category,
        confidence_level: suggestion.confidence,
        description: suggestion.description,
        detection_method: 'ai_assisted',
        metadata: {
          ai_reasoning: suggestion.reasoning,
          ai_confidence: suggestion.confidence,
          ai_suggestions: aiSuggestionMutation.data.suggestions
        }
      }));
    }
  }, [aiSuggestionMutation.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.sign_type) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        student_id: studentId,
        transcript_id: transcriptId,
        sign_type: formData.sign_type,
        description: formData.description,
        evidence_text: selectedText,
        confidence_level: formData.confidence_level || 3,
        detection_method: formData.detection_method || 'manual',
        metadata: formData.metadata
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create success sign:', error);
    }
  };

  const handleUseSuggestion = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      sign_type: suggestion.category,
      confidence_level: suggestion.confidence,
      description: suggestion.description,
      detection_method: 'ai_assisted',
      metadata: {
        ai_reasoning: suggestion.reasoning,
        ai_confidence: suggestion.confidence
      }
    }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 4) return 'border-green-200 text-green-700 bg-green-50';
    if (confidence >= 3) return 'border-yellow-200 text-yellow-700 bg-yellow-50';
    return 'border-red-200 text-red-700 bg-red-50';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Enhanced Success Sign Tagging - {studentName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Sign</TabsTrigger>
            <TabsTrigger value="ai-analysis">
              AI Analysis
              {aiSuggestionMutation.isPending && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Text Display */}
              <div className="space-y-2">
                <Label>Selected Evidence</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm italic text-gray-700">"{selectedText}"</p>
                </div>
              </div>

              {/* AI Suggestion Alert */}
              {aiSuggestionMutation.data?.bestSuggestion && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>AI Suggestion:</strong> {aiSuggestionMutation.data.bestSuggestion.category} 
                        <Badge className={`ml-2 ${getConfidenceColor(aiSuggestionMutation.data.bestSuggestion.confidence)}`}>
                          {aiSuggestionMutation.data.bestSuggestion.confidence}/5 confidence
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleUseSuggestion(aiSuggestionMutation.data.bestSuggestion)}
                        variant="outline"
                      >
                        Use Suggestion
                      </Button>
                    </div>
                    <p className="text-sm mt-1">{aiSuggestionMutation.data.bestSuggestion.description}</p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="sign_type">Success Sign Type</Label>
                <Select
                  value={formData.sign_type}
                  onValueChange={(value: StudentSuccessSign['sign_type']) => 
                    setFormData(prev => ({ ...prev, sign_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sign type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SIGN_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="space-y-1">
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-gray-500">
                            {SIGN_TYPE_DESCRIPTIONS[key as StudentSuccessSign['sign_type']]}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the success behavior you observed..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                />
              </div>

              {/* Confidence Level */}
              <div className="space-y-2">
                <Label htmlFor="confidence_level">Confidence Level</Label>
                <Select
                  value={formData.confidence_level?.toString()}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, confidence_level: parseInt(value) as StudentSuccessSign['confidence_level'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select confidence level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONFIDENCE_LABELS).map(([level, label]) => (
                      <SelectItem key={level} value={level}>
                        <div className="flex items-center gap-2">
                          <Badge className={getConfidenceColor(parseInt(level))}>
                            {label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !formData.description}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Success Sign'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="ai-analysis" className="space-y-4">
            {aiSuggestionMutation.isPending && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Analyzing text with AI...</p>
                </div>
              </div>
            )}

            {aiSuggestionMutation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to get AI analysis: {aiSuggestionMutation.error.message}
                </AlertDescription>
              </Alert>
            )}

            {aiSuggestionMutation.data && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md border">
                  <Label className="text-sm font-medium">Analyzing Text:</Label>
                  <p className="text-sm italic text-gray-700 mt-1">"{selectedText}"</p>
                </div>

                {aiSuggestionMutation.data.suggestions?.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      AI Detected Success Signs ({aiSuggestionMutation.data.suggestions.length})
                    </h3>
                    
                    {aiSuggestionMutation.data.suggestions.map((suggestion: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="capitalize">{suggestion.category}</span>
                              <Badge className={getConfidenceColor(suggestion.confidence)}>
                                {suggestion.confidence}/5
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleUseSuggestion(suggestion)}
                              variant="outline"
                            >
                              Use This
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm mb-2">{suggestion.description}</p>
                          <div className="text-xs text-gray-600">
                            <strong>AI Reasoning:</strong> {suggestion.reasoning}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No clear success indicators found in the selected text. The text might be too short or not contain obvious success behaviors.
                    </AlertDescription>
                  </Alert>
                )}

                {aiSuggestionMutation.data.overall && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Overall Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">{aiSuggestionMutation.data.overall.summary}</p>
                      
                      {aiSuggestionMutation.data.overall.engagement_level && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Engagement Level:</span>
                          <Badge className={getConfidenceColor(aiSuggestionMutation.data.overall.engagement_level)}>
                            {aiSuggestionMutation.data.overall.engagement_level}/5
                          </Badge>
                        </div>
                      )}

                      {aiSuggestionMutation.data.overall.recommendations?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-1">Recommendations:</div>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {aiSuggestionMutation.data.overall.recommendations.map((rec: string, i: number) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};