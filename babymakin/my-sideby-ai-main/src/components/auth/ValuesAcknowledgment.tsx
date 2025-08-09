
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ValuesHeader } from "./values/ValuesHeader";
import { ValuesContent } from "./values/ValuesContent";
import { AcknowledgmentCheckbox } from "./values/AcknowledgmentCheckbox";
import { useValuesAcknowledgment } from "./values/useValuesAcknowledgment";
import { AlertCircle } from "lucide-react";

export function ValuesAcknowledgment() {
  const { acknowledged, setAcknowledged, isLoading, error, handleContinue } = useValuesAcknowledgment();

  console.log("[ValuesAcknowledgment] Render state:", { isLoading, acknowledged, error });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-classroom-orange flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading your values page...</p>
            <p className="text-sm opacity-80">Setting up your authentication and preferences</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with options to retry or continue
  if (error) {
    return (
      <div className="min-h-screen bg-classroom-orange flex items-center justify-center p-4 pt-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/lovable-uploads/e4cab24d-9e67-43cc-aa48-f6b21b0c884e.png")'
          }}
        />
        <Card className="w-full max-w-2xl bg-classroom-cream shadow-2xl animate-fade-up border-none relative z-10">
          <CardHeader>
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Connection Issue</h1>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-700 text-center">{error}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="px-6"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 bg-classroom-orange text-white hover:bg-classroom-orange/90"
              >
                Continue to Dashboard
              </Button>
            </div>
            
            {/* Additional help text */}
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>If this issue persists, our team has been notified and is working on a fix.</p>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="ghost"
              size="sm"
              className="mt-2 text-gray-500 hover:text-gray-700"
            >
              Skip and continue to dashboard
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-classroom-orange flex items-center justify-center p-4 pt-20 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/lovable-uploads/e4cab24d-9e67-43cc-aa48-f6b21b0c884e.png")'
        }}
      />
      <Card className="w-full max-w-4xl bg-classroom-cream shadow-2xl animate-fade-up border-none relative z-10">
        <CardHeader>
          <ValuesHeader />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <ValuesContent />
          <AcknowledgmentCheckbox 
            acknowledged={acknowledged} 
            setAcknowledged={setAcknowledged} 
          />
          
          {/* Environment debug info for production troubleshooting */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-md mt-4">
              <p>Debug: Environment checks and auth state monitoring active</p>
            </div>
          )}
          
          {/* Database information */}
          <div className="text-sm text-blue-600 flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-md">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Database Security Information:</p>
              <p>We've updated our security policies to ensure better access control. If you experience any issues, please try refreshing the page.</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-6">
          <Button
            onClick={handleContinue}
            className="w-full px-8 py-3 text-base font-medium bg-classroom-orange text-white hover:bg-classroom-orange/90 sm:w-auto"
          >
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Add default export for React.lazy compatibility
export default ValuesAcknowledgment;
