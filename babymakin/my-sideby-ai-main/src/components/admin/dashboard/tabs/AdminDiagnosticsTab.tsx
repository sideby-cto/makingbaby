import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bug, Eye, Database, ChartLineUp } from "@phosphor-icons/react";
import { WebhookMonitoring } from "@/components/admin/dashboard/WebhookMonitoring";

export const AdminDiagnosticsTab = () => {
  const [testUserId, setTestUserId] = useState("");
  const [isImpersonating, setIsImpersonating] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-sm text-semantic-text-primary font-sans">
            System Diagnostics
          </h2>
          <p className="text-body-md text-semantic-text-secondary mt-2">
            Monitor system health, test user flows, and diagnose issues
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">System Health</CardTitle>
            <ChartLineUp className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-display-sm font-bold text-green-600">Healthy</div>
            <p className="text-body-xs text-semantic-text-secondary">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Response Time</CardTitle>
            <Database className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-display-sm font-bold text-semantic-text-primary">124ms</div>
            <p className="text-body-xs text-semantic-text-secondary">
              Average API response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Active Sessions</CardTitle>
            <Eye className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-display-sm font-bold text-semantic-text-primary">47</div>
            <p className="text-body-xs text-semantic-text-secondary">
              Users currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Error Rate</CardTitle>
            <Bug className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-display-sm font-bold text-semantic-text-primary">0.2%</div>
            <p className="text-body-xs text-semantic-text-secondary">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Impersonation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} weight="regular" />
            User Impersonation
          </CardTitle>
          <CardDescription>
            View the platform from a specific user's perspective for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-body-sm font-medium text-semantic-text-primary">
                User ID or Email
              </label>
              <Input
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="user@example.com or user-id-123"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={() => setIsImpersonating(!isImpersonating)}
              variant={isImpersonating ? "destructive" : "default"}
            >
              {isImpersonating ? "Stop Impersonating" : "Start Impersonating"}
            </Button>
          </div>
          {isImpersonating && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-body-sm text-yellow-800">
                ⚠️ Currently impersonating user: {testUserId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chaos Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug size={20} weight="regular" />
            Chaos Testing
          </CardTitle>
          <CardDescription>
            Test system resilience by introducing controlled failures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Bug size={16} weight="regular" />
              Simulate API Delays
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Database size={16} weight="regular" />
              Test Database Timeouts
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ChartLineUp size={16} weight="regular" />
              Network Interruption
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye size={16} weight="regular" />
              High Load Simulation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLineUp size={20} weight="regular" />
            Real-time Analytics
          </CardTitle>
          <CardDescription>
            Monitor user flows and system performance in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-semantic-border rounded-lg">
              <div>
                <h4 className="text-body-md font-medium text-semantic-text-primary">
                  User Journey Tracking
                </h4>
                <p className="text-body-sm text-semantic-text-secondary">
                  Monitor how users navigate through the platform
                </p>
              </div>
              <Button variant="outline" size="sm">View Analytics</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-semantic-border rounded-lg">
              <div>
                <h4 className="text-body-md font-medium text-semantic-text-primary">
                  Core Flow Monitoring
                </h4>
                <p className="text-body-sm text-semantic-text-secondary">
                  Track completion rates for key user flows
                </p>
              </div>
              <Button variant="outline" size="sm">View Flows</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-semantic-border rounded-lg">
              <div>
                <h4 className="text-body-md font-medium text-semantic-text-primary">
                  Session Analytics
                </h4>
                <p className="text-body-sm text-semantic-text-secondary">
                  Detailed analysis of user sessions and engagement
                </p>
              </div>
              <Button variant="outline" size="sm">View Sessions</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Monitoring */}
      <WebhookMonitoring />
    </div>
  );
};