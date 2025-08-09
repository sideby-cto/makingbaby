
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { isStaging } from "@/utils/permissions/domainAccess";

export const StageIndicator = () => {
  // Use state to prevent hydration mismatch (since isStaging uses window)
  const [showIndicator, setShowIndicator] = useState(false);
  
  useEffect(() => {
    // Check if we're in staging environment
    setShowIndicator(isStaging());
  }, []);

  if (!showIndicator) return null;
  
  return (
    <div className="fixed top-2 right-2 z-50 flex items-center gap-1 bg-[#8B5CF6] text-white px-3 py-1.5 rounded-full shadow-md border border-[#D6BCFA] animate-pulse">
      <AlertCircle size={16} className="mr-1" />
      <span className="font-bold text-sm">STAGING</span>
    </div>
  );
};
