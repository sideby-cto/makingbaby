
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useState, useEffect } from "react";

interface VerificationOTPProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export const VerificationOTP = ({ 
  value, 
  onChange, 
  maxLength = 6 
}: VerificationOTPProps) => {
  const [localValue, setLocalValue] = useState(value);
  
  // Sync with parent component
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-full flex justify-center">
      <InputOTP
        value={localValue}
        onChange={handleChange}
        maxLength={maxLength}
        pattern="[0-9]*"
        inputMode="numeric"
        containerClassName="gap-2"
      >
        <InputOTPGroup>
          {Array.from({ length: maxLength }).map((_, i) => (
            <InputOTPSlot key={i} index={i} className="h-10 w-10 text-center" />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
};
