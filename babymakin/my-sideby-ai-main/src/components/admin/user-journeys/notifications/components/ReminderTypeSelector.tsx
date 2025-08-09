
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ReminderTypeSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  disabled?: boolean;
  mode: 'create' | 'edit';
}

const reminderTypes = [
  { value: 'initial', label: 'Initial' },
  { value: '24h', label: '24h' },
  { value: '48h', label: '48h' },
  { value: '1_week', label: '1 Week' }
];

export function ReminderTypeSelector({ 
  selectedType, 
  onSelectType, 
  disabled = false,
  mode 
}: ReminderTypeSelectorProps) {
  console.log("ReminderTypeSelector render:", { selectedType, disabled, mode });

  const handleTypeSelect = (type: string) => {
    console.log("Reminder type selected:", type);
    onSelectType(type);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {reminderTypes.map((type) => (
          <Button
            key={type.value}
            type="button"
            variant={selectedType === type.value ? "default" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => handleTypeSelect(type.value)}
            className="min-w-[80px]"
          >
            {type.label}
          </Button>
        ))}
      </div>
      {selectedType && (
        <p className="text-sm text-muted-foreground">
          Selected: {reminderTypes.find(t => t.value === selectedType)?.label}
        </p>
      )}
    </div>
  );
}
