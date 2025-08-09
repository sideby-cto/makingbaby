import { RadioGroup } from "@/components/ui/radio-group";
import { PacingOption } from "./PacingOption";
import { PacingLevel, PacingOptionType } from "./types";

interface PacingSelectorProps {
  selectedPacing: PacingLevel | null;
  pacingOptions: PacingOptionType[];
  onPacingChange: (value: PacingLevel) => void;
}

export const PacingSelector = ({
  selectedPacing,
  pacingOptions,
  onPacingChange,
}: PacingSelectorProps) => {
  return (
    <RadioGroup
      value={selectedPacing || undefined}
      onValueChange={(value) => onPacingChange(value as PacingLevel)}
      className="grid gap-4"
    >
      {pacingOptions.map((option) => (
        <PacingOption
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          icon={option.icon}
          isSelected={selectedPacing === option.value}
          onLockIn={() => onPacingChange(option.value)}
        />
      ))}
    </RadioGroup>
  );
};