import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateEnhancedAnalysis, useEnhancedTranscriptAnalysis } from "@/hooks/useEnhancedTranscriptAnalysis";
import { EnhancedAnalysisDisplay } from "@/components/admin/sessions/EnhancedAnalysisDisplay";

// Get Supabase URL from environment or fallback to a default
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "https://mzoolkwmpppncywkqezd.supabase.co";

interface UpduoTranscriptAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  transcriptId?: string;
  onSuccess?: () => void;
}

export function UpduoTranscriptAnalysisDialog({
  open,
  onOpenChange,
  userId,
  transcriptId,
  onSuccess,
}: UpduoTranscriptAnalysisDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();

  // Enhanced analysis hooks
  const generateEnhancedAnalysis = useGenerateEnhancedAnalysis();
  const { data: enhancedAnalysis, isLoading: loadingEnhanced } = useEnhancedTranscriptAnalysis(transcriptId);

  // Fetch transcript data if transcriptId is provided
  useEffect(() => {
    if (transcriptId && open) {
      fetchTranscriptData(transcriptId);
      if (enhancedAnalysis) {
        setActiveTab('enhanced');
      }
    }
  }, [transcriptId, open, enhancedAnalysis]);

  const fetchTranscriptData = async (id: string) => {
    try {
      setProcessing(true);
      const { data, error } = await supabase
        .from('upduo_transcripts')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTranscriptData(data);
      setActiveTab('analyze');
    } catch (error: any) {
      console.error("Error fetching transcript:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transcript data",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    // For file upload scenario
    if (activeTab === 'upload' && file && userId) {
      await analyzeTranscriptFile(file, userId);
    } 
    // For existing transcript scenario
    else if (activeTab === 'analyze' && transcriptData) {
      await analyzeExistingTranscript(transcriptData);
    } else {
      toast({
        title: "No data to analyze",
        description: "Please select a transcript file or use existing transcript data",
        variant: "destructive",
      });
    }
  };

  const handleEnhancedAnalyze = async () => {
    if (!transcriptId || !userId) {
      toast({
        title: "Missing Information",
        description: "Transcript ID and User ID are required for enhanced analysis",
        variant: "destructive",
      });
      return;
    }

    generateEnhancedAnalysis.mutate({
      transcriptId,
      userId,
      sessionTitle: transcriptData?.metadata?.session_title || 'Upduo Session',
      skipCache: false
    });
  };

  const analyzeTranscriptFile = async (file: File, userId: string) => {
    try {
      setProcessing(true);
      const fileText = await file.text();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/analyze-transcript`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            transcript: fileText,
            userId: userId,
            isSecondOpinion: false,
            adminId: session.user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze transcript: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Analysis complete",
        description: "The transcript has been analyzed and profile suggestions have been generated.",
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error analyzing transcript:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze transcript",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const analyzeExistingTranscript = async (transcriptData: any) => {
    try {
      setProcessing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Extract the user ID from the transcript data
      const userId = transcriptData.user_id;
      if (!userId) {
        throw new Error("No user ID found in transcript data");
      }

      // Assuming the transcript data has a 'transcript' field with the content
      if (!transcriptData.transcript && !transcriptData.metadata) {
        throw new Error("No transcript content found");
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/analyze-transcript`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            transcriptId: transcriptData.id, // Send the transcript ID instead of content
            userId: userId,
            isSecondOpinion: false,
            adminId: session.user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze transcript: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Analysis complete",
        description: "The transcript has been analyzed and profile suggestions have been generated.",
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error analyzing transcript:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze transcript",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Analyze Upduo Transcript</DialogTitle>
          <DialogDescription>
            Upload a transcript file (.vtt format) or use existing transcript data to analyze and generate profile insights.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" disabled={processing}>Upload File</TabsTrigger>
            <TabsTrigger value="analyze" disabled={!transcriptData || processing}>Basic Analysis</TabsTrigger>
            <TabsTrigger value="enhanced" disabled={!transcriptData || processing}>Enhanced Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="transcript" className="text-sm font-medium">
                Transcript File
              </label>
              <input
                id="transcript"
                type="file"
                accept=".vtt"
                onChange={handleFileChange}
                disabled={processing}
                className="border border-input bg-background rounded-md px-3 py-2"
              />
              <p className="text-xs text-muted-foreground">
                Only .vtt files are supported
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="py-4">
            {transcriptData ? (
              <div className="space-y-4">
                <div className="border rounded p-3 bg-muted/20">
                  <h3 className="font-medium mb-2">Transcript Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>User:</div>
                    <div>{transcriptData.profiles?.first_name} {transcriptData.profiles?.last_name}</div>
                    <div>Date:</div>
                    <div>{new Date(transcriptData.created_at).toLocaleDateString()}</div>
                    <div>Session:</div>
                    <div>{transcriptData.metadata?.session_title || "Untitled Session"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {processing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading transcript data...</p>
                  </div>
                ) : (
                  <p>No transcript data available</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enhanced" className="py-4">
            {transcriptData && (
              <div className="space-y-4">
                <div className="border rounded p-3 bg-muted/20">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Enhanced Semantic Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Advanced AI analysis including emotional sentiment, engagement patterns, semantic embeddings, and learning insights.
                  </p>
                  
                  {!enhancedAnalysis && (
                    <Button
                      onClick={handleEnhancedAnalyze}
                      disabled={generateEnhancedAnalysis.isPending}
                      className="gap-2"
                    >
                      {generateEnhancedAnalysis.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Generate Enhanced Analysis
                    </Button>
                  )}
                </div>

                {(loadingEnhanced || generateEnhancedAnalysis.isPending) && (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Generating enhanced analysis...</p>
                  </div>
                )}

                {enhancedAnalysis && (
                  <EnhancedAnalysisDisplay analysis={enhancedAnalysis} />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing || generateEnhancedAnalysis.isPending}
          >
            Close
          </Button>
          {activeTab !== 'enhanced' && (
            <Button 
              onClick={handleAnalyze} 
              disabled={(activeTab === 'upload' && !file) || (activeTab === 'analyze' && !transcriptData) || processing}
              className="gap-2"
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin" />}
              {processing ? "Processing..." : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
