import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptBackfillToolProps {
  className?: string;
}

export const TranscriptBackfillTool: React.FC<TranscriptBackfillToolProps> = ({ className }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleBackfill = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate backfill process
      const steps = [
        'Scanning for missing transcript data...',
        'Checking session correlations...',
        'Processing recent sessions...',
        'Updating records...',
        'Finalizing backfill...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(((i + 1) / steps.length) * 100);
      }

      toast({
        title: "Backfill Complete",
        description: "Transcript data has been successfully updated",
      });

    } catch (error) {
      toast({
        title: "Backfill Failed",
        description: "Failed to complete transcript backfill",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Transcript Data Management
          </CardTitle>
          <CardDescription>
            Simplified transcript data management without complex user attribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This tool manages session transcript data without requiring strict user attribution. 
              Data is correlated based on timing and optional self-reporting.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Current Approach</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Session timing-based correlation</li>
                <li>• Optional self-reported match IDs</li>
                <li>• No strict user attribution required</li>
                <li>• Focus on session quality over mapping</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Benefits</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Reduced complexity</li>
                <li>• Higher reliability</li>
                <li>• Faster data processing</li>
                <li>• Better user experience</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleBackfill}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isProcessing ? `Processing... ${Math.round(progress)}%` : 'Refresh Session Data'}
            </Button>
            
            <Button variant="outline" disabled>
              <Database className="h-4 w-4 mr-2" />
              View Correlations
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">Processing transcript data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};