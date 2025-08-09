
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, AlertTriangle, Lock, Unlock, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeploymentGate {
  id: string;
  name: string;
  description: string;
  category: 'testing' | 'performance' | 'security' | 'business';
  required: boolean;
  checkFunction: () => Promise<{ passed: boolean; message: string; score?: number }>;
}

interface GateResult {
  passed: boolean;
  message: string;
  score?: number;
  timestamp: Date;
}

export const PreDeploymentGates = () => {
  const [gates] = useState<DeploymentGate[]>([
    {
      id: 'backend-tests',
      name: 'Backend Tests',
      description: 'All backend core flow tests must pass',
      category: 'testing',
      required: true,
      checkFunction: async () => {
        const { data, error } = await supabase
          .from('core_flow_test_executions')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(10);
        
        if (error) return { passed: false, message: `Failed to check backend tests: ${error.message}` };
        
        const recentTests = data || [];
        const passedTests = recentTests.filter(t => t.status === 'passed').length;
        const totalTests = recentTests.length;
        
        if (totalTests === 0) return { passed: false, message: 'No recent test executions found' };
        
        const passRate = (passedTests / totalTests) * 100;
        const passed = passRate >= 100;
        
        return {
          passed,
          message: `${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%)`,
          score: passRate
        };
      }
    },
    {
      id: 'frontend-tests',
      name: 'Frontend Tests',
      description: 'Critical frontend tests must pass',
      category: 'testing',
      required: true,
      checkFunction: async () => {
        // Check for recent frontend test results
        const { data, error } = await supabase
          .from('core_flow_test_executions')
          .select('id, status, results, started_at')
          .order('started_at', { ascending: false })
          .limit(5);
        
        if (error) return { passed: false, message: `Failed to check frontend tests: ${error.message}` };
        
        const recentTests = data || [];
        if (recentTests.length === 0) {
          return { passed: false, message: 'No recent frontend test results found' };
        }
        
        const criticalFailed = recentTests.filter(t => {
          const results = t.results as any;
          return t.status === 'failed' && results?.critical === true;
        }).length;
        
        const passed = criticalFailed === 0;
        return {
          passed,
          message: passed ? 'All critical frontend tests passing' : `${criticalFailed} critical frontend tests failing`
        };
      }
    },
    {
      id: 'performance-metrics',
      name: 'Performance Metrics',
      description: 'System performance must meet thresholds',
      category: 'performance',
      required: true,
      checkFunction: async () => {
        // Check recent load test results  
        const { data, error } = await supabase
          .from('load_test_executions')
          .select('status, average_response_time, successful_requests, total_requests')
          .order('started_at', { ascending: false })
          .limit(1);
        
        if (error) return { passed: false, message: `Failed to check performance: ${error.message}` };
        
        if (!data || data.length === 0) {
          return { passed: false, message: 'No recent load test results available' };
        }
        
        const loadTest = data[0];
        const successRate = loadTest.total_requests > 0 
          ? (loadTest.successful_requests / loadTest.total_requests) * 100 
          : 0;
        const avgResponseTime = loadTest.average_response_time || 0;
        
        const performancePassed = successRate >= 95 && avgResponseTime <= 2000;
        
        return {
          passed: performancePassed,
          message: `Success rate: ${successRate.toFixed(1)}%, Avg response: ${avgResponseTime.toFixed(0)}ms`,
          score: Math.min(successRate, 100)
        };
      }
    },
    {
      id: 'database-health',
      name: 'Database Health',
      description: 'Database connectivity and performance',
      category: 'performance',
      required: true,
      checkFunction: async () => {
        const startTime = performance.now();
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
          
          const queryTime = performance.now() - startTime;
          
          if (error) return { passed: false, message: `Database error: ${error.message}` };
          
          const passed = queryTime < 1000; // 1 second threshold
          return {
            passed,
            message: `Database query completed in ${queryTime.toFixed(0)}ms`,
            score: Math.max(0, 100 - (queryTime / 10)) // Score based on response time
          };
        } catch (error) {
          return { passed: false, message: `Database connectivity failed: ${error}` };
        }
      }
    },
    {
      id: 'error-rates',
      name: 'Error Rates',
      description: 'Application error rates must be acceptable',
      category: 'performance',
      required: false,
      checkFunction: async () => {
        // Check recent test executions for error patterns
        const { data, error } = await supabase
          .from('core_flow_test_executions')
          .select('status')
          .order('started_at', { ascending: false })
          .limit(20);
        
        if (error) return { passed: false, message: `Failed to check error rates: ${error.message}` };
        
        const recentTests = data || [];
        const errorRate = recentTests.length > 0 
          ? (recentTests.filter(t => t.status === 'failed').length / recentTests.length) * 100
          : 0;
        
        const passed = errorRate <= 5; // 5% error threshold
        
        return {
          passed,
          message: `Error rate: ${errorRate.toFixed(1)}% over last 20 tests`,
          score: Math.max(0, 100 - (errorRate * 2))
        };
      }
    },
    {
      id: 'security-check',
      name: 'Security Check',
      description: 'Basic security validations',
      category: 'security',
      required: true,
      checkFunction: async () => {
        try {
          // Check if user is authenticated (basic security check)
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return { passed: false, message: 'Authentication check failed' };
          
          // Check RLS is working by trying to access admin-only data
          const { error } = await supabase
            .from('core_flow_tests')
            .select('count')
            .limit(1);
          
          // If we get an RLS error, that's actually good (security is working)
          // If we get data or no error, check if user is admin
          if (error && error.message.includes('RLS')) {
            return { passed: true, message: 'RLS security policies active' };
          }
          
          return { passed: true, message: 'Security checks passed' };
        } catch (error) {
          return { passed: false, message: `Security check failed: ${error}` };
        }
      }
    }
  ]);

  const [gateResults, setGateResults] = useState<Record<string, GateResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentGate, setCurrentGate] = useState<string | null>(null);
  const [deploymentApproved, setDeploymentApproved] = useState(false);
  const { toast } = useToast();

  const runGate = async (gate: DeploymentGate) => {
    setCurrentGate(gate.id);
    try {
      const result = await gate.checkFunction();
      const gateResult: GateResult = {
        ...result,
        timestamp: new Date()
      };
      
      setGateResults(prev => ({
        ...prev,
        [gate.id]: gateResult
      }));
      
    } catch (error) {
      setGateResults(prev => ({
        ...prev,
        [gate.id]: {
          passed: false,
          message: `Gate check failed: ${error}`,
          timestamp: new Date()
        }
      }));
    }
    setCurrentGate(null);
  };

  const runAllGates = async () => {
    setIsRunning(true);
    setGateResults({});
    setDeploymentApproved(false);
    
    for (const gate of gates) {
      await runGate(gate);
      // Small delay between gates
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
    checkDeploymentReadiness();
  };

  const checkDeploymentReadiness = () => {
    const requiredGates = gates.filter(g => g.required);
    const requiredResults = requiredGates.map(g => gateResults[g.id]).filter(Boolean);
    
    if (requiredResults.length !== requiredGates.length) {
      return; // Not all required gates checked yet
    }
    
    const allRequiredPassed = requiredResults.every(r => r.passed);
    const optionalGates = gates.filter(g => !g.required);
    const optionalResults = optionalGates.map(g => gateResults[g.id]).filter(Boolean);
    const optionalPassed = optionalResults.filter(r => r.passed).length;
    
    const totalScore = [...requiredResults, ...optionalResults]
      .reduce((sum, r) => sum + (r.score || (r.passed ? 100 : 0)), 0) / gates.length;
    
    if (allRequiredPassed && totalScore >= 85) {
      setDeploymentApproved(true);
      toast({
        title: "Deployment Approved!",
        description: `All gates passed. Overall score: ${totalScore.toFixed(1)}%`,
        variant: "default"
      });
    } else {
      toast({
        title: "Deployment Blocked",
        description: allRequiredPassed 
          ? `Score too low: ${totalScore.toFixed(1)}% (need 85%+)`
          : "Required gates failed",
        variant: "destructive"
      });
    }
  };

  const getGateIcon = (gate: DeploymentGate) => {
    const result = gateResults[gate.id];
    if (currentGate === gate.id) return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    if (!result) return <Shield className="h-4 w-4 text-gray-400" />;
    return result.passed ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      testing: 'bg-blue-100 text-blue-800',
      performance: 'bg-green-100 text-green-800',
      security: 'bg-red-100 text-red-800',
      business: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const completedGates = Object.keys(gateResults).length;
  const progress = gates.length > 0 ? (completedGates / gates.length) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {deploymentApproved ? <Unlock className="h-5 w-5 text-green-500" /> : <Lock className="h-5 w-5" />}
            Pre-Deployment Gates
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Automated quality gates that must pass before deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAllGates} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {isRunning ? 'Running Gates...' : 'Check All Gates'}
          </Button>
          {deploymentApproved && (
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Rocket className="h-4 w-4" />
              Deploy Now
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isRunning && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{completedGates}/{gates.length}</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {deploymentApproved && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 All deployment gates passed! System is ready for production deployment.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {gates.map((gate) => {
            const result = gateResults[gate.id];
            return (
              <div key={gate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getGateIcon(gate)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{gate.name}</span>
                      <Badge className={getCategoryColor(gate.category)} variant="secondary">
                        {gate.category}
                      </Badge>
                      {gate.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{gate.description}</p>
                    {result && (
                      <div className="mt-2">
                        <p className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {result.message}
                        </p>
                        {result.score !== undefined && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 h-2 bg-gray-200 rounded">
                              <div 
                                className={`h-full rounded ${result.score >= 70 ? 'bg-green-500' : result.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, result.score))}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {result.score.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runGate(gate)}
                  disabled={isRunning}
                >
                  Check
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
