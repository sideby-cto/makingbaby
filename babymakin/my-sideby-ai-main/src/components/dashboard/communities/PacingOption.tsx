import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PacingOptionProps {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onLockIn?: () => void;
}

export const PacingOption = ({
  value,
  label,
  description,
  icon: Icon,
  isSelected,
  onLockIn,
}: PacingOptionProps) => {
  return (
    <div
      className={`flex items-center space-x-4 rounded-lg border p-4 transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
    >
      <RadioGroupItem value={value} id={value} />
      <Label
        htmlFor={value}
        className="flex flex-1 cursor-pointer items-center justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {isSelected && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              onLockIn?.();
            }}
            className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
          >
            Lock In
          </Button>
        )}
      </Label>
    </div>
  );
};