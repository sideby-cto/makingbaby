
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Target,
  RefreshCw,
  Download,
  Sparkles
} from 'lucide-react';
import { chaosTestingService } from '@/services/chaosTestingService';
import { TestError, TestMetrics, GoalOrientedTestConfig, ExecutiveSummary, RoleBasedRecommendations } from '@/types/chaos-testing';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChaosTestingConfig } from './ChaosTestingConfig';
import { TestResultsView } from './TestResultsView';
import { ExecutiveSummaryCard } from './ExecutiveSummaryCard';
import { RoleBasedRecommendations as RoleRecommendationsCard } from './RoleBasedRecommendations';
import { BusinessViewToggle } from './BusinessViewToggle';

export const ChaosTestingDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [errors, setErrors] = useState<TestError[]>([]);
  const [metrics, setMetrics] = useState<TestMetrics>({
    totalActions: 0,
    errorsFound: 0,
    deadEndsFound: 0,
    vulnerabilitiesFound: 0,
    performanceIssues: 0,
    testDuration: 0,
    coveragePercent: 0
  });
  const [config, setConfig] = useState<GoalOrientedTestConfig>({
    duration: 5,
    actionsPerMinute: 12,
    enableRandomData: true,
    enableSqlInjection: false,
    enableXssTests: false,
    maxDepth: 3,
    explorationStrategy: 'breadth-first',
    smartFormFilling: true,
    routeLearning: true
  });
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [roleRecommendations, setRoleRecommendations] = useState<RoleBasedRecommendations | null>(null);
  const [isBusinessView, setIsBusinessView] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load previous sessions
    loadSessions();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      if (isRunning) {
        updateMetrics();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chaos_test_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const updateMetrics = () => {
    const currentErrors = chaosTestingService.getErrors();
    const currentMetrics = chaosTestingService.getMetrics();
    
    setErrors(currentErrors);
    setMetrics(currentMetrics);
  };

  const handleStartTesting = async () => {
    try {
      console.log('[Dashboard] Starting chaos testing with config:', config);
      
      const sessionId = await chaosTestingService.startTesting(config);
      setCurrentSessionId(sessionId);
      setIsRunning(true);
      setErrors([]);
      setExecutiveSummary(null);
      setRoleRecommendations(null);
      
      toast({
        title: "Chaos Testing Started",
        description: `Testing will run for ${config.duration} minutes with ${config.actionsPerMinute} actions per minute.`,
      });
      
      // Reload sessions to show the new one
      loadSessions();
      
    } catch (error) {
      console.error('Failed to start testing:', error);
      toast({
        title: "Failed to Start Testing",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleStopTesting = async () => {
    try {
      await chaosTestingService.stopTesting();
      setIsRunning(false);
      
      toast({
        title: "Chaos Testing Stopped",
        description: "Testing session has been completed and results are saved.",
      });
      
      // Reload sessions
      loadSessions();
      
    } catch (error) {
      console.error('Failed to stop testing:', error);
      toast({
        title: "Error Stopping Testing",
        description: "Testing may still be running. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateInsights = async () => {
    if (!currentSessionId) {
      toast({
        title: "No Session Available",
        description: "Please run a test session first to generate insights.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingInsights(true);
    
    try {
      const { executiveSummary, roleBasedRecommendations } = await chaosTestingService.generateBusinessInsights(currentSessionId);
      
      setExecutiveSummary(executiveSummary);
      setRoleRecommendations(roleBasedRecommendations);
      
      toast({
        title: "Business Insights Generated",
        description: "AI-powered analysis of testing results is now available.",
      });
      
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast({
        title: "Failed to Generate Insights",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const { data: session } = await supabase
        .from('chaos_test_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      const { data: logs } = await supabase
        .from('chaos_test_logs')
        .select('*')
        .eq('test_session_id', sessionId);

      if (session) {
        setCurrentSessionId(sessionId);
        setMetrics({
          totalActions: session.total_actions || 0,
          errorsFound: session.errors_found || 0,
          deadEndsFound: session.dead_ends_found || 0,
          vulnerabilitiesFound: session.vulnerabilities_found || 0,
          performanceIssues: session.performance_issues || 0,
          testDuration: session.test_duration_seconds || 0,
          coveragePercent: session.coverage_percent || 0
        });

        // Convert logs to TestError format
        const convertedErrors: TestError[] = (logs || []).map(log => ({
          id: log.id,
          timestamp: new Date(log.created_at),
          type: log.test_type as any,
          severity: log.severity as any,
          description: log.description,
          location: log.location,
          stackTrace: log.stack_trace,
          userAction: log.user_action,
          reproductionSteps: Array.isArray(log.reproduction_steps) 
            ? log.reproduction_steps as string[]
            : typeof log.reproduction_steps === 'string' 
              ? [log.reproduction_steps]
              : []
        }));

        setErrors(convertedErrors);

        // Load business insights if available
        if (session.business_insights && typeof session.business_insights === 'object') {
          const insights = session.business_insights as any;
          if (insights.executiveSummary) {
            setExecutiveSummary(insights.executiveSummary);
          }
          if (insights.roleBasedRecommendations) {
            setRoleRecommendations(insights.roleBasedRecommendations);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast({
        title: "Failed to Load Session",
        description: "Could not load the selected test session.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const hasBusinessTranslations = executiveSummary !== null && roleRecommendations !== null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chaos Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Automated application testing to discover issues and improve reliability
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={isRunning ? handleStopTesting : handleStartTesting}
            disabled={isRunning && !chaosTestingService.isTestingRunning()}
            className={isRunning ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Testing
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Testing
              </>
            )}
          </Button>
          
          {currentSessionId && !isRunning && (
            <Button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              variant="outline"
            >
              {isGeneratingInsights ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Business Insights
            </Button>
          )}
        </div>
      </div>

      {/* Business View Toggle */}
      <BusinessViewToggle 
        isBusinessView={isBusinessView}
        onToggle={setIsBusinessView}
        hasTranslations={hasBusinessTranslations}
      />

      {/* Executive Summary and Role-Based Recommendations */}
      {isBusinessView && hasBusinessTranslations && (
        <div className="space-y-6">
          <ExecutiveSummaryCard summary={executiveSummary!} />
          <RoleRecommendationsCard recommendations={roleRecommendations!} />
        </div>
      )}

      {/* Testing Status */}
      {isRunning && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Chaos testing is running... {metrics.totalActions} actions completed in {Math.floor(metrics.testDuration / 60)}m {metrics.testDuration % 60}s
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current Test</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalActions}</div>
                <p className="text-xs text-muted-foreground">
                  {isRunning ? 'In progress...' : 'Completed'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.errorsFound}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.vulnerabilitiesFound} critical
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(metrics.testDuration / 60)}m {metrics.testDuration % 60}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Running time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(metrics.coveragePercent)}%</div>
                <Progress value={metrics.coveragePercent} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Errors */}
          {errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>
                  Latest problems discovered during testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {errors.slice(-5).reverse().map((error) => (
                    <div key={error.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <Badge className={getSeverityColor(error.severity)}>
                        {error.severity.toUpperCase()}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{error.description}</p>
                        <p className="text-sm text-muted-foreground">{error.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {error.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results">
          <TestResultsView 
            errors={errors} 
            metrics={metrics}
            isBusinessView={isBusinessView}
          />
        </TabsContent>

        <TabsContent value="config">
          <ChaosTestingConfig 
            config={config}
            onConfigChange={setConfig}
            disabled={isRunning}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Session History</CardTitle>
              <CardDescription>
                Previous chaos testing sessions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => loadSession(session.id)}
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(session.started_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.total_actions || 0} actions, {session.errors_found || 0} issues found
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                      {session.business_insights && (
                        <Badge variant="outline">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Insights
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No test sessions yet. Run your first chaos test to see results here.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
