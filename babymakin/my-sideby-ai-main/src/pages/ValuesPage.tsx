import React from "react";
import { ValuesHeader } from "@/components/auth/values/ValuesHeader";
import { ValuesContent } from "@/components/auth/values/ValuesContent";
import { AcknowledgmentCheckbox } from "@/components/auth/values/AcknowledgmentCheckbox";
import { Button } from "@/components/ui/button";
import { useValuesAcknowledgment } from "@/components/auth/values/useValuesAcknowledgment";

const ValuesPage = () => {
  const { acknowledged, setAcknowledged, isLoading, handleContinue } = useValuesAcknowledgment();

  return (
    <div className="min-h-screen bg-classroom-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ValuesHeader />
        <ValuesContent />
        
        <div className="mt-8 space-y-6">
          <AcknowledgmentCheckbox 
            acknowledged={acknowledged}
            setAcknowledged={setAcknowledged}
          />
          
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={!acknowledged || isLoading}
              size="lg"
              className="px-8"
            >
              {isLoading ? "Processing..." : "Continue to Dashboard"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuesPage;