
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { Match } from "../../types/matches";

interface AnalysisStarterProps {
  match: Match;
  onStartAnalysis: () => Promise<void>;
  isLoading: boolean;
}

export const AnalysisStarter: React.FC<AnalysisStarterProps> = ({
  match,
  onStartAnalysis,
  isLoading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Touchpoint Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">AI Learning Touchpoint Analysis</h3>
          <p className="text-muted-foreground mb-4">
            Analyze Upduo transcripts to identify collaboration opportunities and learning connections between {match.user1?.first_name} and {match.user2?.first_name}.
          </p>
          <Button onClick={onStartAnalysis} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
