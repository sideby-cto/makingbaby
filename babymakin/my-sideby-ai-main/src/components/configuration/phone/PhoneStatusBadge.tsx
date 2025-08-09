
import { Badge } from "@/components/ui/badge";
import { Check, ShieldAlert } from "lucide-react";

interface PhoneStatusBadgeProps {
  isVerified: boolean;
}

export const PhoneStatusBadge = ({ isVerified }: PhoneStatusBadgeProps) => {
  if (isVerified) {
    return (
      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
        <Check className="mr-1 h-3 w-3" /> Verified
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
      <ShieldAlert className="mr-1 h-3 w-3" /> Unverified
    </Badge>
  );
};
