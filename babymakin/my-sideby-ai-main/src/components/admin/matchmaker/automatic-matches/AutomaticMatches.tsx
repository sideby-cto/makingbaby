
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutomaticMatchSuggestions } from "./hooks/useAutomaticMatchSuggestions";
import { MatchSuggestionCard } from "../matches/MatchSuggestionCard";
import { useCreateMatch } from "../matches/hooks/useCreateMatch";
import { DataReadinessCheck } from "./components/DataReadinessCheck";

interface AutomaticMatchesProps {
  refetchMatches: () => void;
}

export const AutomaticMatches: React.FC<AutomaticMatchesProps> = ({ refetchMatches }) => {
  const [weights, setWeights] = useState({
    hatSimilarity: 0.5,
    journeyStage: 0.3,
    reflectionCompletion: 0.2,
  });
  const [isLoadingWeights, setIsLoadingWeights] = useState(false);
  const [errorWeights, setErrorWeights] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    suggestions,
    isLoading,
    error,
    refetch,
    hasEmbeddings,
    hasSimilarities,
  } = useAutomaticMatchSuggestions(weights);

  const { createMatch } = useCreateMatch();
  const [creatingMatches, setCreatingMatches] = useState(new Set<string>());

  useEffect(() => {
    const storedWeights = localStorage.getItem("automaticMatchWeights");
    if (storedWeights) {
      setWeights(JSON.parse(storedWeights));
    }
  }, []);

  const handleWeightChange = (
    key: keyof typeof weights,
    value: number
  ) => {
    const newWeights = { ...weights, [key]: value };
    setWeights(newWeights);
  };

  const handleSaveWeights = async () => {
    setIsLoadingWeights(true);
    setErrorWeights(null);
    try {
      localStorage.setItem(
        "automaticMatchWeights",
        JSON.stringify(weights)
      );
      toast({
        title: "Weights Saved",
        description: "The automatic match weights have been saved.",
      });
    } catch (err) {
      console.error("Error saving weights:", err);
      setErrorWeights("Failed to save weights. Please try again.");
      toast({
        title: "Error",
        description:
          "Failed to save automatic match weights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWeights(false);
    }
  };

  const handleCreateMatch = async (user1Id: string, user2Id: string) => {
    setCreatingMatches((prev) => new Set(prev).add(`${user1Id}-${user2Id}`));
    try {
      await createMatch({ user1_id: user1Id, user2_id: user2Id });
      await refetchMatches();
      await refetch();
    } catch (err) {
      console.error("Error creating match:", err);
    } finally {
      setCreatingMatches((prev) => {
        const next = new Set(prev);
        next.delete(`${user1Id}-${user2Id}`);
        return next;
      });
    }
  };

  const handleRefreshData = async () => {
    await refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Automatic Match Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Adjust the weights to influence the automatic match suggestions.
          </p>

          <DataReadinessCheck
            hasEmbeddings={hasEmbeddings}
            hasSimilarities={hasSimilarities}
            onRefreshData={handleRefreshData}
          />

          {errorWeights && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorWeights}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hatSimilarity">Hat Similarity Weight</Label>
              <Input
                type="number"
                id="hatSimilarity"
                value={weights.hatSimilarity}
                onChange={(e) =>
                  handleWeightChange(
                    "hatSimilarity",
                    parseFloat(e.target.value)
                  )
                }
                min="0"
                max="1"
                step="0.05"
              />
            </div>
            <div>
              <Label htmlFor="journeyStage">Journey Stage Weight</Label>
              <Input
                type="number"
                id="journeyStage"
                value={weights.journeyStage}
                onChange={(e) =>
                  handleWeightChange("journeyStage", parseFloat(e.target.value))
                }
                min="0"
                max="1"
                step="0.05"
              />
            </div>
            <div>
              <Label htmlFor="reflectionCompletion">
                Reflection Completion Weight
              </Label>
              <Input
                type="number"
                id="reflectionCompletion"
                value={weights.reflectionCompletion}
                onChange={(e) =>
                  handleWeightChange(
                    "reflectionCompletion",
                    parseFloat(e.target.value)
                  )
                }
                min="0"
                max="1"
                step="0.05"
              />
            </div>
          </div>

          <Button onClick={handleSaveWeights} disabled={isLoadingWeights}>
            {isLoadingWeights ? "Saving..." : "Save Weights"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">Match Suggestions</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Based on the configured weights, here are some suggested matches.
          </p>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : suggestions.length === 0 ? (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                No match suggestions available. Try adjusting the weights or ensuring there are users available for matching.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <MatchSuggestionCard
                  key={`${suggestion.user1.id}-${suggestion.user2.id}`}
                  suggestion={suggestion}
                  onMatch={() => handleCreateMatch(suggestion.user1.id, suggestion.user2.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
