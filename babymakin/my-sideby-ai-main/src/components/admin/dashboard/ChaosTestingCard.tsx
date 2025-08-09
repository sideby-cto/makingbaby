import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cat, ArrowRight, AlertTriangle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatusFallback } from "@/hooks/useAdminStatusFallback";
import { WebSocketStatus } from "@/components/monitoring/WebSocketMonitor";
import { supabase } from "@/integrations/supabase/client";

export const ChaosTestingCard = () => {
  const { user } = useAuth();
  const { isAdmin, loading, connectionHealth } = useAdminStatusFallback();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const collectDebugInfo = async () => {
      console.log("ChaosTestingCard: Starting debug collection");
      
      const info: any = {
        userExists: !!user,
        userId: user?.id,
        userEmail: user?.email,
        isAdminFromHook: isAdmin,
        loadingFromHook: loading,
        timestamp: new Date().toISOString()
      };

      if (user) {
        try {
          // Test direct admin function
          const { data: adminCheck, error: adminError } = await supabase
            .rpc('is_current_user_admin');
          
          info.directAdminCheck = { data: adminCheck, error: adminError?.message };

          // Test debug function
          const { data: debugData, error: debugError } = await supabase
            .rpc('debug_admin_check');
          
          info.debugFunction = { data: debugData, error: debugError?.message };

        } catch (err: any) {
          info.rpcError = err.message;
        }
      }

      console.log("ChaosTestingCard debug info:", info);
      setDebugInfo(info);
    };

    collectDebugInfo();
  }, [user, isAdmin, loading]);

  // Show card with debug info for troubleshooting
  const shouldShow = isAdmin || (!loading && user?.email?.includes('@sideby.ai'));

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
          Cat in the Fort
          {!shouldShow && (
            <div title="Visibility Issue">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Cat className="h-6 w-6 text-orange-600" />
          <Button
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => setShowDebug(!showDebug)}
            title="Toggle debug info"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-700 mb-4">
          Chaos testing dashboard for application resilience and stress testing. 
          Monitor system behavior under adverse conditions.
        </p>
        
        {showDebug && debugInfo && (
          <div className="mb-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Debug Info:</h4>
            <pre className="text-xs text-orange-700 whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        {!shouldShow && (
          <div className="mb-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
            <p className="text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Admin access detection issue. Contact support if you should have access.
            </p>
          </div>
        )}
        
        <Button asChild variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
          <Link to="/admin/chaos-testing" className="flex items-center">
            Open Dashboard
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
        
        {/* Connection health indicator */}
        {(!connectionHealth.connected || connectionHealth.errors > 0) && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800">Connection Status</h4>
            <div className="text-sm text-amber-700 mt-1">
              Status: {connectionHealth.connected ? '🟢 Connected' : '🔴 Disconnected'}<br/>
              Errors: {connectionHealth.errors}<br/>
              {connectionHealth.reconnectAttempts > 0 && (
                <>Reconnect attempts: {connectionHealth.reconnectAttempts}<br/></>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Global WebSocket status monitor */}
      <WebSocketStatus />
    </Card>
  );
};