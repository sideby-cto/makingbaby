import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Clock, Users, Target, Zap } from 'lucide-react';

export const CoreFlowHowTo = () => {
  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Core Flow Monitoring Guide
          </CardTitle>
          <CardDescription>
            Complete guide to monitoring and maintaining the educator experience flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The Core Flow represents the critical path educators take from initial signup to becoming active community members. 
              Any disruption in this flow directly impacts user success and retention.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Start Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Daily Health Check</h4>
                <p className="text-sm text-muted-foreground">Review the Health Dashboard for any red or yellow indicators</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Run Critical Tests</h4>
                <p className="text-sm text-muted-foreground">Execute end-to-end flow tests at least twice daily</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Monitor Alerts</h4>
                <p className="text-sm text-muted-foreground">Respond to critical alerts within 15 minutes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Core Flow Stages</CardTitle>
          <CardDescription>Understanding each critical stage of the educator journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold flex items-center gap-2">
                1. Registration & Email Verification
                <Badge variant="outline">Critical</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                User creates account and verifies email address
              </p>
              <div className="mt-2 text-sm">
                <strong>Key Metrics:</strong> Registration completion rate, email verification rate
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold flex items-center gap-2">
                2. Values Acknowledgment
                <Badge variant="outline">Critical</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                User reviews and accepts sideby community values
              </p>
              <div className="mt-2 text-sm">
                <strong>Key Metrics:</strong> Values acknowledgment rate, time to completion
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold flex items-center gap-2">
                3. Onboarding Flow
                <Badge variant="outline">Critical</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Profile setup, community selection, and pacing preferences
              </p>
              <div className="mt-2 text-sm">
                <strong>Key Metrics:</strong> Onboarding completion rate, step abandonment rates
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold flex items-center gap-2">
                4. First Match Creation
                <Badge variant="outline">High Impact</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                System creates first learning partnership match
              </p>
              <div className="mt-2 text-sm">
                <strong>Key Metrics:</strong> Time to first match, match success rate
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold flex items-center gap-2">
                5. Active Engagement
                <Badge variant="outline">Retention</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                User actively uses dashboard, tools, and community features
              </p>
              <div className="mt-2 text-sm">
                <strong>Key Metrics:</strong> Daily active users, feature adoption, session duration
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Monitoring Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">✅ Do This</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Check health dashboard first thing each morning</li>
                <li>• Run end-to-end tests before major releases</li>
                <li>• Set up alerts for critical metrics</li>
                <li>• Document incidents and resolutions</li>
                <li>• Monitor user feedback channels</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">❌ Avoid This</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ignoring yellow warning indicators</li>
                <li>• Running tests only when issues occur</li>
                <li>• Delaying incident response</li>
                <li>• Making changes without testing</li>
                <li>• Overlooking user journey drop-offs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Response Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Alert Response Procedures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                Critical Alert (Red)
              </h4>
              <p className="text-sm text-red-700 mt-1">
                <strong>Response Time:</strong> Immediate (within 5 minutes)
              </p>
              <p className="text-sm text-red-700">
                <strong>Action:</strong> Stop all non-essential activities, investigate immediately, escalate if needed
              </p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                Warning Alert (Yellow)
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                <strong>Response Time:</strong> Within 15 minutes
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Action:</strong> Investigate, document findings, implement fix within 1 hour
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                Info Alert (Blue)
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Response Time:</strong> Within 1 hour
              </p>
              <p className="text-sm text-blue-700">
                <strong>Action:</strong> Review during next scheduled maintenance window
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Procedures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Testing Procedures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Automated Test Schedule</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Full End-to-End Flow</span>
                  <Badge variant="outline">Every 2 hours</Badge>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Registration Flow</span>
                  <Badge variant="outline">Every 30 minutes</Badge>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Authentication</span>
                  <Badge variant="outline">Every 15 minutes</Badge>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Database Health</span>
                  <Badge variant="outline">Every 5 minutes</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Manual Testing Triggers</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Before any production deployment</li>
                <li>• After database migrations</li>
                <li>• When user reports issues</li>
                <li>• Weekly comprehensive flow test</li>
                <li>• After infrastructure changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Procedures */}
      <Card>
        <CardHeader>
          <CardTitle>Escalation Procedures</CardTitle>
          <CardDescription>When and how to escalate critical issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium">Immediate Issues</h4>
                <p className="text-sm text-muted-foreground">Complete system outage, data loss, security breach</p>
                <p className="text-sm font-medium text-red-600">Escalate immediately to technical lead</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium">High Impact Issues</h4>
                <p className="text-sm text-muted-foreground">Flow blocked for &gt;50% of users, major feature failure</p>
                <p className="text-sm font-medium text-yellow-600">Escalate within 30 minutes if not resolved</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium">Medium Impact Issues</h4>
                <p className="text-sm text-muted-foreground">Performance degradation, single feature issues</p>
                <p className="text-sm font-medium text-blue-600">Escalate if not resolved within 2 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};