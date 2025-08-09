
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminMatchmakerAccessProps {
  children: ReactNode;
}

export const AdminMatchmakerAccess = ({ children }: AdminMatchmakerAccessProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminCheckLoading } = useAdminStatus();
  
  const loading = authLoading || adminCheckLoading;

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="container max-w-6xl p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96 md:col-span-2" />
            <Skeleton className="h-96 md:col-span-1" />
          </div>
        </div>
      </div>
    );
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="container max-w-6xl p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User is admin, show content
  return <>{children}</>;
};
