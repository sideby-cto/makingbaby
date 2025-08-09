
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSubmitHandler } from "@/hooks/useSubmitHandler";
import { JourneyStageConfig } from "./hooks/useJourneyStageSettings";

interface StageFormProps {
  initialData?: JourneyStageConfig;
  onSubmit: () => void;
  onCancel: () => void;
}

export const StageForm: React.FC<StageFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    stage: initialData?.stage || '',
    label: initialData?.label || '',
    value: initialData?.value || '',
    color: initialData?.color || '#6B7280',
    display_order: initialData?.display_order || 0,
  });
  
  const { isSubmitting, submitWithHandler } = useSubmitHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitFunction = async () => {
      console.log('🔄 Starting database operation for stage:', formData.stage);
      
      if (initialData) {
        // Update existing stage - single optimized query
        const { error } = await supabase
          .from('journey_stage_config')
          .update({
            stage: formData.stage,
            label: formData.label,
            value: formData.value,
            color: formData.color,
            display_order: formData.display_order,
          })
          .eq('id', initialData.id);

        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        
        console.log('✅ Stage updated successfully');
      } else {
        // Create new stage
        const { error } = await supabase
          .from('journey_stage_config')
          .insert([{
            stage: formData.stage,
            label: formData.label,
            value: formData.value,
            color: formData.color,
            display_order: formData.display_order,
          }]);

        if (error) {
          console.error('❌ Insert error:', error);
          throw error;
        }
        
        console.log('✅ Stage created successfully');
      }
    };

    await submitWithHandler(submitFunction, {
      onSuccess: () => {
        console.log('✅ Form submission completed, calling onSubmit callback');
        onSubmit();
      },
      successMessage: initialData 
        ? "Journey stage updated successfully" 
        : "Journey stage created successfully",
      errorMessage: "Failed to save journey stage. Please try again.",
      timeout: 8000 // Shorter timeout for this specific operation
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage Key</Label>
          <Input
            id="stage"
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            placeholder="e.g., new, active"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="label">Display Label</Label>
          <Input
            id="label"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g., New User"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="e.g., new"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex space-x-2">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-20"
            />
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#6B7280"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_order">Display Order</Label>
        <Input
          id="display_order"
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
          min="0"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Stage' : 'Create Stage'}
        </Button>
      </div>
    </form>
  );
};
