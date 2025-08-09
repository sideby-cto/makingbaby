
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle, XCircle, Clock, Monitor, Smartphone, Tablet, AlertTriangle } from 'lucide-react';

interface FrontendTest {
  id: string;
  name: string;
  description: string;
  url: string;
  selectors: {
    [key: string]: string;
  };
  assertions: {
    type: string;
    target: string;
    expected: any;
  }[];
  devices: string[];
}

interface TestResult {
  testId: string;
  device: string;
  status: 'passed' | 'failed' | 'running';
  duration?: number;
  error?: string;
  screenshots?: string[];
  logs?: string[];
}

export const FrontendTestRunner = () => {
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Frontend tests configuration
  const frontendTests: FrontendTest[] = [
    {
      id: 'dashboard-load',
      name: 'Dashboard Load Test',
      description: 'Verify dashboard loads within 3 seconds and displays user data',
      url: '/dashboard',
      selectors: {
        userProfile: '[data-testid="user-profile"]',
        navigationMenu: '[data-testid="navigation-menu"]',
        loadingIndicator: '[data-testid="loading"]'
      },
      assertions: [
        { type: 'exists', target: 'userProfile', expected: true },
        { type: 'loadTime', target: 'page', expected: 3000 },
        { type: 'notExists', target: 'loadingIndicator', expected: true }
      ],
      devices: ['desktop', 'tablet', 'mobile']
    },
    {
      id: 'match-creation-ui',
      name: 'Match Creation UI Test',
      description: 'Test match creation interface and validation',
      url: '/admin/matchmaker',
      selectors: {
        userSelect: '[data-testid="user-select"]',
        createButton: '[data-testid="create-match-button"]',
        successMessage: '[data-testid="success-message"]'
      },
      assertions: [
        { type: 'exists', target: 'userSelect', expected: true },
        { type: 'clickable', target: 'createButton', expected: true }
      ],
      devices: ['desktop', 'tablet']
    },
    {
      id: 'conversation-interface',
      name: 'Conversation Interface Test',
      description: 'Test 1:1 conversation UI components',
      url: '/matches/[test-match-id]',
      selectors: {
        messageInput: '[data-testid="message-input"]',
        sendButton: '[data-testid="send-button"]',
        messageList: '[data-testid="message-list"]'
      },
      assertions: [
        { type: 'exists', target: 'messageInput', expected: true },
        { type: 'enabled', target: 'sendButton', expected: true }
      ],
      devices: ['desktop', 'mobile']
    }
  ];

  const runTest = async (test: FrontendTest) => {
    const testId = test.id;
    setRunningTests(prev => new Set(prev).add(testId));
    setProgress(0);

    try {
      for (let i = 0; i < test.devices.length; i++) {
        const device = test.devices[i];
        
        // Add running result
        setTestResults(prev => [
          ...prev.filter(r => !(r.testId === testId && r.device === device)),
          { testId, device, status: 'running' }
        ]);

        // Simulate test execution
        const testResult = await simulateTestExecution(test, device);
        
        // Update result
        setTestResults(prev => [
          ...prev.filter(r => !(r.testId === testId && r.device === device)),
          testResult
        ]);

        setProgress(((i + 1) / test.devices.length) * 100);
        
        // Small delay between device tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "Test Completed",
        description: `${test.name} has finished running on all devices.`
      });

    } catch (error) {
      toast({
        title: "Test Failed",
        description: `Failed to run ${test.name}: ${error}`,
        variant: "destructive"
      });
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
      setProgress(0);
    }
  };

  const simulateTestExecution = async (test: FrontendTest, device: string): Promise<TestResult> => {
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Simulate test results (80% pass rate for demo)
    const passed = Math.random() > 0.2;
    
    return {
      testId: test.id,
      device,
      status: passed ? 'passed' : 'failed',
      duration: Math.floor(1000 + Math.random() * 4000),
      error: passed ? undefined : 'Element not found or assertion failed',
      logs: [
        `Navigating to ${test.url}`,
        `Testing on ${device} viewport`,
        `Checking ${test.assertions.length} assertions`,
        passed ? 'All assertions passed' : 'Some assertions failed'
      ]
    };
  };

  const runAllTests = async () => {
    for (const test of frontendTests) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getTestResults = (testId: string) => {
    return testResults.filter(r => r.testId === testId);
  };

  const getOverallStatus = (testId: string) => {
    const results = getTestResults(testId);
    if (results.length === 0) return 'not-run';
    if (results.some(r => r.status === 'running')) return 'running';
    if (results.every(r => r.status === 'passed')) return 'passed';
    if (results.some(r => r.status === 'failed')) return 'failed';
    return 'partial';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Frontend Test Runner</h3>
          <p className="text-muted-foreground">Automated UI tests across multiple devices</p>
        </div>
        <Button onClick={runAllTests} disabled={runningTests.size > 0}>
          <Play className="w-4 h-4 mr-2" />
          Run All Frontend Tests
        </Button>
      </div>

      {/* Progress */}
      {runningTests.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running tests...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tests */}
      <div className="grid gap-4">
        {frontendTests.map((test) => {
          const isRunning = runningTests.has(test.id);
          const overallStatus = getOverallStatus(test.id);
          const results = getTestResults(test.id);
          
          return (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {overallStatus === 'running' && <Clock className="w-5 h-5 text-blue-500 animate-spin" />}
                    {overallStatus === 'passed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {overallStatus === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                    {overallStatus === 'not-run' && <Clock className="w-5 h-5 text-gray-400" />}
                    
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {test.devices.length} device{test.devices.length !== 1 ? 's' : ''}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => runTest(test)}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    URL: {test.url}
                  </div>
                  
                  {/* Device Results */}
                  {results.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Device Results:</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {results.map((result) => (
                          <div key={`${result.testId}-${result.device}`} 
                               className="flex items-center gap-2 p-2 border rounded-lg">
                            {getDeviceIcon(result.device)}
                            <span className="text-sm capitalize">{result.device}</span>
                            
                            {result.status === 'running' && (
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1 animate-spin" />
                                Running
                              </Badge>
                            )}
                            {result.status === 'passed' && (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Passed
                              </Badge>
                            )}
                            {result.status === 'failed' && (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                            
                            {result.duration && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {result.duration}ms
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Error Details */}
                  {results.some(r => r.error) && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <div className="space-y-1">
                          {results.filter(r => r.error).map((result) => (
                            <div key={`${result.testId}-${result.device}-error`}>
                              <strong>{result.device}:</strong> {result.error}
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
