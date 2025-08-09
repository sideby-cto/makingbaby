
import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface UseDebouncedInputOptions {
  delay?: number;
  onSave?: (value: string) => Promise<void> | void;
}

export function useDebouncedInput(
  initialValue: string,
  options: UseDebouncedInputOptions = {}
) {
  const { delay = 500, onSave } = options;
  
  const [inputValue, setInputValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedValue = useDebounce(inputValue, delay);

  // Auto-save when debounced value changes
  const handleAutoSave = useCallback(async () => {
    if (debouncedValue !== initialValue && onSave) {
      try {
        setIsSaving(true);
        await onSave(debouncedValue);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [debouncedValue, initialValue, onSave]);

  // Trigger auto-save when debounced value changes
  useEffect(() => {
    if (debouncedValue !== initialValue) {
      handleAutoSave();
    }
  }, [debouncedValue, initialValue, handleAutoSave]);

  return {
    value: inputValue,
    setValue: setInputValue,
    debouncedValue,
    isSaving,
    isDirty: inputValue !== initialValue
  };
}
