
import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLoadingStateManager } from "@/components/ui/loading/LoadingStateManager";

interface DashboardLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
}

export const DashboardLayout = React.memo(({ children, loading }: DashboardLayoutProps) => {
  const { profile, loading: profileLoading, viewingAsUserId, originalUser } = useProfile();
  const { startMeasure, endMeasure } = usePerformanceMonitor('DashboardLayout');
  const { isLoading: managedLoading, setLoading } = useLoadingStateManager({
    minimumLoadTime: 200,
    debounceTime: 50
  });

  useEffect(() => {
    startMeasure();
    
    // Manage loading state more efficiently
    setLoading(loading || profileLoading);
    
    return () => {
      endMeasure();
    };
  }, [startMeasure, endMeasure, loading, profileLoading, setLoading]);

  if (managedLoading) {
    return (
      <div className="min-h-screen bg-background-light pt-16">
        <Navbar />
        <div className="container mx-auto px-4 pt-4">
          <div className="flex justify-center">
            <div className="w-full max-w-6xl">
              <Skeleton className="h-[600px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isImpersonating = !!viewingAsUserId && !!originalUser;

  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      {isImpersonating && (
        <ImpersonationBanner 
          originalUser={originalUser}
          impersonatedUserId={viewingAsUserId}
          impersonatedUserEmail={profile?.email}
        />
      )}
      <div className={`pt-16 ${isImpersonating ? "mt-10" : ""}`} />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-0">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
