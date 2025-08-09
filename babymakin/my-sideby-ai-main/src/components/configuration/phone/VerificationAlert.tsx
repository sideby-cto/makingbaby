
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface VerificationAlertProps {
  onShowVerification: () => void;
}

export const VerificationAlert = ({ onShowVerification }: VerificationAlertProps) => {
  return (
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
      <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="flex-grow">
        <p className="text-sm text-amber-800 mb-2">
          Your phone number isn't verified. Verify it to enable SMS notifications.
        </p>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-white border-amber-300 hover:bg-amber-100 text-amber-700"
          onClick={onShowVerification}
        >
          Verify Now
        </Button>
      </div>
    </div>
  );
};
