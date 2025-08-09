import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAiTranscriptAnalysis } from '@/hooks/useAiSuccessAnalysis';
import { useStudentSuccessSigns } from '@/hooks/useStudentSuccessSigns';
import { Brain, Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import type { AiSuccessAnalysis } from '@/hooks/useAiSuccessAnalysis';

interface AutoAnalyzeTranscriptButtonProps {
  transcriptText: string;
  studentId: string;
  studentName: string;
  transcriptId?: string;
  onAnalysisComplete?: () => void;
}

export const AutoAnalyzeTranscriptButton: React.FC<AutoAnalyzeTranscriptButtonProps> = ({
  transcriptText,
  studentId,
  studentName,  
  transcriptId,
  onAnalysisComplete
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiSuccessAnalysis | null>(null);
  
  const analyzeTranscriptMutation = useAiTranscriptAnalysis();
  const { refetch: refetchSuccessSigns } = useStudentSuccessSigns(studentId);

  const handleAnalyze = async () => {
    if (!transcriptText || transcriptText.length < 50) {
      return;
    }

    try {
      const result = await analyzeTranscriptMutation.mutateAsync({
        transcriptText,
        studentId,
        transcriptId,
        mode: 'analyze'
      });
      
      setAnalysisResult(result.analysis);
      setShowPreview(true);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleCreateSigns = async () => {
    if (!analysisResult) return;

    try {
      await analyzeTranscriptMutation.mutateAsync({
        transcriptText,
        studentId,
        transcriptId,
        mode: 'create'
      });
      
      // Refresh success signs list
      await refetchSuccessSigns();
      
      setShowPreview(false);
      setAnalysisResult(null);
      onAnalysisComplete?.();
    } catch (error) {
      console.error('Failed to create success signs:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 4) return 'border-green-200 text-green-700 bg-green-50';
    if (confidence >= 3) return 'border-yellow-200 text-yellow-700 bg-yellow-50';
    return 'border-red-200 text-red-700 bg-red-50';
  };

  const isTranscriptTooShort = !transcriptText || transcriptText.length < 50;

  return (
    <>
      <Button
        onClick={handleAnalyze}
        disabled={analyzeTranscriptMutation.isPending || isTranscriptTooShort}
        className="flex items-center gap-2"
        variant="outline"
      >
        {analyzeTranscriptMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4" />
            AI Auto-Analyze
          </>
        )}
      </Button>

      {isTranscriptTooShort && (
        <p className="text-xs text-gray-500 mt-1">
          Transcript too short for analysis (need at least 50 characters)
        </p>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis Results - {studentName}
            </DialogTitle>
          </DialogHeader>

          {analysisResult && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{analysisResult.overall_analysis.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Engagement Level:</span>
                      <Badge className={getConfidenceColor(analysisResult.overall_analysis.engagement_level)}>
                        {analysisResult.overall_analysis.engagement_level}/5
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Learning Indicators:</span>
                      <Badge className={getConfidenceColor(analysisResult.overall_analysis.learning_indicators)}>
                        {analysisResult.overall_analysis.learning_indicators}/5
                      </Badge>
                    </div>
                  </div>

                  {analysisResult.overall_analysis.patterns.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Patterns:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {analysisResult.overall_analysis.patterns.map((pattern, index) => (
                          <li key={index}>{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.overall_analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {analysisResult.overall_analysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detected Success Signs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Detected Success Signs ({analysisResult.success_signs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.success_signs.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.success_signs.map((sign, index) => (
                        <div key={index} className="border-l-4 border-l-blue-500 p-4 bg-gray-50 rounded-r-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{sign.category}</span>
                              <Badge className={getConfidenceColor(sign.confidence)}>
                                {sign.confidence}/5 confidence
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-2 font-medium">{sign.description}</p>
                          
                          <div className="bg-white p-2 rounded border mb-2">
                            <p className="text-xs text-gray-600 italic">Evidence:</p>
                            <p className="text-sm">"{sign.evidence}"</p>
                          </div>
                          
                          <div className="text-xs text-gray-600">
                            <strong>AI Reasoning:</strong> {sign.reasoning}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No clear success signs were detected in this transcript. The content may not contain obvious success behaviors or may need manual review.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={analyzeTranscriptMutation.isPending}
            >
              Cancel
            </Button>
            
            {analysisResult?.success_signs.length > 0 && (
              <Button
                onClick={handleCreateSigns}
                disabled={analyzeTranscriptMutation.isPending}
                className="flex items-center gap-2"
              >
                {analyzeTranscriptMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Create {analysisResult.success_signs.length} Success Signs
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};