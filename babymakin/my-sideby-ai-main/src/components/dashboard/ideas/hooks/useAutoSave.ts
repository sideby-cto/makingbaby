import { useState, useCallback, useRef, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface AutoSaveOptions {
  delay?: number;
  onSave: (changes: any) => Promise<void>;
  onError?: (error: any) => void;
}

interface PendingChanges {
  excitement?: number;
  alignment?: number;
}

export const useAutoSave = (options: AutoSaveOptions) => {
  const { delay = 1000, onSave, onError } = options;
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const debouncedChanges = useDebounce(pendingChanges, delay);
  const lastSavedChanges = useRef<PendingChanges>({});

  // Auto-save when debounced changes are different from last saved
  const performAutoSave = useCallback(async () => {
    const hasChanges = Object.keys(debouncedChanges).length > 0;
    const isDifferent = JSON.stringify(debouncedChanges) !== JSON.stringify(lastSavedChanges.current);
    
    if (hasChanges && isDifferent) {
      try {
        setIsSaving(true);
        setSaveError(null);
        await onSave(debouncedChanges);
        lastSavedChanges.current = { ...debouncedChanges };
        setPendingChanges({});
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Save failed';
        setSaveError(errorMessage);
        onError?.(error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [debouncedChanges, onSave, onError]);

  // Trigger auto-save when debounced changes update
  useEffect(() => {
    performAutoSave();
  }, [performAutoSave]);

  const updateExcitement = useCallback((level: number) => {
    setPendingChanges(prev => ({
      ...prev,
      excitement: level
    }));
    setSaveError(null);
  }, []);

  const updateAlignment = useCallback((level: number) => {
    setPendingChanges(prev => ({
      ...prev,
      alignment: level
    }));
    setSaveError(null);
  }, []);

  const retry = useCallback(() => {
    if (saveError) {
      performAutoSave();
    }
  }, [saveError, performAutoSave]);

  return {
    pendingChanges,
    isSaving,
    saveError,
    updateExcitement,
    updateAlignment,
    retry,
    hasPendingChanges: Object.keys(pendingChanges).length > 0
  };
};