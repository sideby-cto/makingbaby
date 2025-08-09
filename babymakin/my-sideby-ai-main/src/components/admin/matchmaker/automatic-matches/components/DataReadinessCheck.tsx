
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataReadinessCheckProps {
  hasEmbeddings: boolean;
  hasSimilarities: boolean;
  onRefreshData: () => void;
}

export const DataReadinessCheck = ({ hasEmbeddings, hasSimilarities, onRefreshData }: DataReadinessCheckProps) => {
  if (hasEmbeddings && hasSimilarities) return null;
  
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertDescription>
        <div className="space-y-2">
          <p>Missing required data for optimal matching:</p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            {!hasEmbeddings && <li>Hat embeddings not generated</li>}
            {!hasSimilarities && <li>Hat similarity data not available</li>}
          </ul>
          <div className="pt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onRefreshData}
              className="text-xs"
            >
              Generate Missing Data
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
