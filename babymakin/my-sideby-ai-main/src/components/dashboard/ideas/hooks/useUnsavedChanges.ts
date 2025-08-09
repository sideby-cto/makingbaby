
import { useState, useEffect, useCallback } from "react";

interface UnsavedChangesState {
  hasUnsavedChanges: boolean;
  pendingChanges: {
    excitement?: number;
    alignment?: number;
  };
  isSaving: boolean;
}

export const useUnsavedChanges = (
  initialExcitement: number,
  initialAlignment: number
) => {
  const [state, setState] = useState<UnsavedChangesState>({
    hasUnsavedChanges: false,
    pendingChanges: {},
    isSaving: false
  });

  // Reset when initial values change (new item selected)
  useEffect(() => {
    setState({
      hasUnsavedChanges: false,
      pendingChanges: {},
      isSaving: false
    });
  }, [initialExcitement, initialAlignment]);

  const setPendingExcitement = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      hasUnsavedChanges: true,
      pendingChanges: {
        ...prev.pendingChanges,
        excitement: level
      }
    }));
  }, []);

  const setPendingAlignment = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      hasUnsavedChanges: true,
      pendingChanges: {
        ...prev.pendingChanges,
        alignment: level
      }
    }));
  }, []);

  const clearUnsavedChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasUnsavedChanges: false,
      pendingChanges: {}
    }));
  }, []);

  const setSaving = useCallback((isSaving: boolean) => {
    setState(prev => ({
      ...prev,
      isSaving
    }));
  }, []);

  const getCurrentExcitement = useCallback(() => {
    return state.pendingChanges.excitement ?? initialExcitement;
  }, [state.pendingChanges.excitement, initialExcitement]);

  const getCurrentAlignment = useCallback(() => {
    return state.pendingChanges.alignment ?? initialAlignment;
  }, [state.pendingChanges.alignment, initialAlignment]);

  return {
    hasUnsavedChanges: state.hasUnsavedChanges,
    pendingChanges: state.pendingChanges,
    isSaving: state.isSaving,
    setPendingExcitement,
    setPendingAlignment,
    clearUnsavedChanges,
    setSaving,
    getCurrentExcitement,
    getCurrentAlignment
  };
};
