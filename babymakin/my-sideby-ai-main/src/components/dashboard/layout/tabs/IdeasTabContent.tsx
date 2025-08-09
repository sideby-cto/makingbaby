
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ReflectedInsightsGallery = lazy(() => import("@/components/dashboard/ideas/ReflectedInsightsGallery"));

interface IdeasTabContentProps {
  userId: string;
}

export const IdeasTabContent: React.FC<IdeasTabContentProps> = ({ userId }) => {
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    console.log("IdeasTabContent: Component mounted/updated with userId:", {
      userId,
      userIdType: typeof userId,
      userIdLength: userId?.length,
      isEmptyString: userId === '',
      isNull: userId === null,
      isUndefined: userId === undefined
    });
    
    // Validate userId format (should be UUID)
    if (userId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      console.warn("IdeasTabContent: Invalid userId format:", userId);
      setError("Invalid user ID format");
      return;
    }
    
    // Clear any previous errors if userId is valid
    if (userId && error) {
      setError(null);
    }
    
    // Add a slight delay before showing content to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true);
      console.log("IdeasTabContent: Content made visible for userId:", userId);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [userId, error]);
  
  if (!userId) {
    console.error("IdeasTabContent: No userId provided - this should not happen in normal flow");
    return (
      <div className="flex justify-center py-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            User ID is required to display insights. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    console.error("IdeasTabContent: Error state:", error);
    return (
      <div className="flex justify-center py-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log("IdeasTabContent: Rendering main content with userId:", userId, "isVisible:", isVisible);

  return (
    <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Suspense fallback={
        <div className="py-8">
          <div className="text-center mb-4">
            <p className="text-sm text-classroom-text-secondary">Loading your ideas...</p>
          </div>
          <Skeleton className="h-[400px] w-full rounded-md" />
        </div>
      }>
        <div className="insights-gallery-container">
          <ReflectedInsightsGallery userId={userId} />
        </div>
      </Suspense>
    </div>
  );
};
