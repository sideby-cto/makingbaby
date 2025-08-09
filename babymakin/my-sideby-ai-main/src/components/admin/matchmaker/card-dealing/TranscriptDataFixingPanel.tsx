
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const TranscriptDataFixingPanel: React.FC = () => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRecalculateWordCounts = async () => {
    setIsRecalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('recalculate-transcript-word-counts');

      if (error) {
        throw error;
      }

      if (data?.success) {
        setLastResult(data);
        toast({
          title: "Word Counts Recalculated",
          description: `Updated ${data.updatedCount} transcripts, ${data.errorCount} errors`,
        });
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error recalculating word counts:', error);
      toast({
        title: "Recalculation Failed",
        description: error.message || 'Could not recalculate word counts',
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <AlertTriangle className="h-5 w-5" />
          Transcript Data Fixing Panel
        </CardTitle>
        <p className="text-sm text-amber-700">
          Fix data quality issues in stored transcripts
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-amber-200">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Word Count Recalculation
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Many existing transcripts have incorrect word counts (showing 0 even when they contain content). 
            This will recalculate word counts and quality scores for all transcripts.
          </p>
          
          <Button 
            onClick={handleRecalculateWordCounts}
            disabled={isRecalculating}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isRecalculating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate All Word Counts
              </>
            )}
          </Button>
        </div>

        {lastResult && (
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Last Recalculation Results
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Updated:</span>
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                  {lastResult.updatedCount}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Errors:</span>
                <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                  {lastResult.errorCount}
                </Badge>
              </div>
            </div>
            
            {lastResult.results && lastResult.results.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  View Sample Results
                </summary>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {lastResult.results.slice(0, 10).map((result: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded flex items-center justify-between">
                      <span className="font-mono">{result.id.substring(0, 8)}...</span>
                      {result.success ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {result.skipped ? 'Already correct' : `${result.oldWordCount} → ${result.newWordCount} words`}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">Error</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
