
import React from 'react';
import { ChaosTestingDashboard } from '@/components/chaos-testing/ChaosTestingDashboard';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { PerformanceToastProvider } from '@/components/ui/performance-toast';
import { usePerformanceImprovement } from '@/hooks/usePerformanceImprovement';
import { useChaosNavigationHandler } from '@/hooks/useChaosNavigationHandler';
import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function ChaosTestingPage() {
  // Initialize performance monitoring
  usePerformanceImprovement();
  
  // Handle chaos testing navigation events
  useChaosNavigationHandler();

  return (
    <ErrorBoundary>
      <AdminLayout>
        <PerformanceToastProvider />
        <ConnectionStatus />
        <div className="py-8">
          <ChaosTestingDashboard />
        </div>
      </AdminLayout>
    </ErrorBoundary>
  );
}
