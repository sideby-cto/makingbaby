
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SIGN_TYPE_LABELS, SIGN_TYPE_DESCRIPTIONS, CONFIDENCE_LABELS } from "@/types/student-success";
import { Brain, Users, TrendingUp, Quote } from "lucide-react";

interface SuccessStoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisResult: any;
}

export const SuccessStoriesDialog = ({
  open,
  onOpenChange,
  analysisResult
}: SuccessStoriesDialogProps) => {
  if (!analysisResult) return null;

  const { signs, analysis_summary } = analysisResult;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand-primary" />
            Student Success Signs Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Signs Found</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-brand-primary">
                      {analysis_summary.total_signs}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Signs by Type</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      {Object.entries(analysis_summary.by_type).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="capitalize">{type}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Analysis Time</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {new Date(analysis_summary.analyzed_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Signs List */}
              {signs.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Identified Success Signs</h3>
                  {signs.map((sign: any, index: number) => (
                    <Card key={sign.id || index} className="border-l-4 border-l-brand-primary">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-brand-secondary/20 text-brand-primary">
                              {SIGN_TYPE_LABELS[sign.sign_type as keyof typeof SIGN_TYPE_LABELS]}
                            </Badge>
                            <Badge variant="outline">
                              Confidence: {CONFIDENCE_LABELS[sign.confidence_level as keyof typeof CONFIDENCE_LABELS]}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {sign.metadata?.student_name}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {SIGN_TYPE_DESCRIPTIONS[sign.sign_type as keyof typeof SIGN_TYPE_DESCRIPTIONS]}
                        </p>
                        
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm">{sign.description}</p>
                        </div>

                        {sign.evidence_text && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-1">
                              <Quote className="h-3 w-3" />
                              Evidence from Transcript
                            </h4>
                            <blockquote className="text-sm italic border-l-2 border-muted pl-3 text-muted-foreground">
                              "{sign.evidence_text}"
                            </blockquote>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Success Signs Found</h3>
                    <p className="text-muted-foreground">
                      No clear evidence of student success signs was identified in this session transcript.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
