
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MatchSuggestion, AiMatchEnhancement } from "../../types/matchmaking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Share2, Sparkles, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAiMatchEnhancement } from "../hooks/useAiMatchEnhancement";

interface EnhancedMatchCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: MatchSuggestion;
  onMatch: (rationale: string) => void;
}

export const EnhancedMatchCreationDialog: React.FC<EnhancedMatchCreationDialogProps> = ({
  open,
  onOpenChange,
  suggestion,
  onMatch,
}) => {
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [manualRationale, setManualRationale] = useState(suggestion.rationale || "");
  const [aiRationale, setAiRationale] = useState<string>("");
  const { enhanceMatchSuggestion, enhancement, loading } = useAiMatchEnhancement();

  // Automatically get AI enhancement when dialog is opened
  useEffect(() => {
    if (open && !enhancement) {
      enhanceMatchSuggestion(suggestion)
        .then(result => {
          if (result) {
            setAiRationale(result.rationale);
          }
        });
    }
  }, [open, suggestion, enhancement, enhanceMatchSuggestion]);

  const handleConfirm = () => {
    // Use either the AI or manual rationale depending on which tab is active
    const finalRationale = activeTab === "ai" ? aiRationale : manualRationale;
    onMatch(finalRationale);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Match</DialogTitle>
          <DialogDescription>
            Create a match between {suggestion.user1.first_name} and {suggestion.user2.first_name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai" disabled={loading && !enhancement}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI Analysis
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Analysis
                </>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Match Rationale</h3>
                <Textarea
                  value={manualRationale}
                  onChange={(e) => setManualRationale(e.target.value)}
                  placeholder="Explain why this match would be beneficial..."
                  className="h-32"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : enhancement ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Brain className="mr-2 h-4 w-4" /> 
                      AI Match Analysis
                    </CardTitle>
                    <CardDescription>
                      Compatibility Score: 
                      <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500">
                        {enhancement.compatibilityScore}/100
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Rationale</h4>
                        <p className="text-sm text-muted-foreground">{enhancement.rationale}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Share2 className="mr-2 h-4 w-4" />
                          Conversation Starters
                        </h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {enhancement.conversationStarters.map((starter, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{starter}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Edit AI Rationale (optional)</h3>
                  <Textarea
                    value={aiRationale}
                    onChange={(e) => setAiRationale(e.target.value)}
                    className="h-24"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Failed to load AI analysis. Please use manual mode instead.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={activeTab === "manual" && !manualRationale.trim()}>
            Create Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
