
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Analysis {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  analysis_data: any;
  created_at: string;
}

interface AnalysisStatusProps {
  analysis: Analysis;
}

export const AnalysisStatus: React.FC<AnalysisStatusProps> = ({ analysis }) => {
  const getStatusBadge = () => {
    switch (analysis.status) {
      case 'completed':
        return <Badge variant="default">completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">failed</Badge>;
      default:
        return <Badge variant="secondary">{analysis.status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analysis Status</h3>
        {getStatusBadge()}
      </div>
      
      {analysis.status === 'failed' && analysis.error_message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{analysis.error_message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
