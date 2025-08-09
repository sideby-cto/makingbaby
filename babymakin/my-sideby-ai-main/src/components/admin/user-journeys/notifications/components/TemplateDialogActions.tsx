
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";

interface TemplateDialogActionsProps {
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TemplateDialogActions({
  mode,
  isSubmitting,
  onCancel,
  onSubmit
}: TemplateDialogActionsProps) {
  const submitButtonText = mode === 'create' ? 'Create Template' : 'Save Template';

  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === 'create' ? 'Creating...' : 'Saving...'}
          </>
        ) : (
          <>
            {mode === 'edit' && <Save className="mr-2 h-4 w-4" />}
            {submitButtonText}
          </>
        )}
      </Button>
    </DialogFooter>
  );
}
