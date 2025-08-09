
import React from "react";
import { Check, Clock, Save, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SaveStatusIndicatorProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveError?: string | null;
}

export const SaveStatusIndicator = ({
  hasUnsavedChanges,
  isSaving,
  saveError
}: SaveStatusIndicatorProps) => {
  if (isSaving) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
        <Clock className="h-3 w-3 mr-1 animate-spin" />
        Saving...
      </Badge>
    );
  }

  if (saveError) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Save failed
      </Badge>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
        <Save className="h-3 w-3 mr-1" />
        Unsaved changes
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
      <Check className="h-3 w-3 mr-1" />
      All changes saved
    </Badge>
  );
};
