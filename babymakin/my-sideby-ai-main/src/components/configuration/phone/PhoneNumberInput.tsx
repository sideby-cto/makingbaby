
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPhoneNumber } from "@/services/notifications/smsService";

interface PhoneNumberInputProps {
  phoneNumber: string;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdatePhone: () => void;
  isUpdatingPhone: boolean;
}

export const PhoneNumberInput = ({ 
  phoneNumber, 
  onPhoneChange, 
  onUpdatePhone, 
  isUpdatingPhone 
}: PhoneNumberInputProps) => {
  const [formattedDisplay, setFormattedDisplay] = useState("");
  const [isValid, setIsValid] = useState(true);
  
  // Format the phone number for display
  useEffect(() => {
    if (!phoneNumber) {
      setFormattedDisplay("");
      setIsValid(true);
      return;
    }
    
    try {
      const formatted = formatPhoneNumber(phoneNumber);
      setFormattedDisplay(phoneNumber);
      setIsValid(formatted.length >= 10);
    } catch (err) {
      setIsValid(false);
    }
  }, [phoneNumber]);
  
  const handleInputBlur = () => {
    if (phoneNumber && phoneNumber.trim() !== "") {
      const formatted = formatPhoneNumber(phoneNumber);
      setFormattedDisplay(formatted);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <div className="flex space-x-2">
          <div className="relative flex-grow max-w-xs">
            <Input 
              id="phoneNumber"
              type="tel"
              placeholder="+1 (123) 456-7890"
              value={formattedDisplay}
              onChange={onPhoneChange}
              onBlur={handleInputBlur}
              className={`pl-10 ${!isValid && phoneNumber ? 'border-red-300 focus:border-red-500' : ''}`}
              inputMode="tel"
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button 
            type="button" 
            variant="outline"
            disabled={isUpdatingPhone}
            onClick={onUpdatePhone}
          >
            {isUpdatingPhone ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
        {!isValid && phoneNumber && (
          <p className="text-xs text-red-500 mt-1">
            Please enter a valid phone number with country code (e.g., +1 for US)
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Enter your phone number in international format (e.g., +1 for US numbers)
        </p>
      </div>
    </>
  );
};
