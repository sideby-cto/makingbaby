
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Users, Pause, Play, RotateCcw, TrendingUp, AlertTriangle } from 'lucide-react';

interface RolloutStage {
  id: string;
  name: string;
  description: string;
  userPercentage: number;
  successCriteria: {
    minSuccessRate: number;
    maxErrorRate: number;
    maxResponseTime: number;
  };
  duration: number; // minutes
}

interface RolloutStatus {
  currentStage: number;
  status: 'not_started' | 'running' | 'paused' | 'completed' | 'rolled_back';
  startTime?: Date;
  stageStartTime?: Date;
  metrics: {
    successRate: number;
    errorRate: number;
    avgResponseTime: number;
    usersFailed: number;
    usersSucceeded: number;
  };
}

export const GradualRolloutPanel = () => {
  const [rolloutStages] = useState<RolloutStage[]>([
    {
      id: 'canary',
      name: 'Canary Release',
      description: 'Deploy to 1% of users for initial validation',
      userPercentage: 1,
      successCriteria: {
        minSuccessRate: 99,
        maxErrorRate: 0.5,
        maxResponseTime: 2000
      },
      duration: 15
    },
    {
      id: 'beta',
      name: 'Beta Release',
      description: 'Deploy to 5% of users for broader testing',
      userPercentage: 5,
      successCriteria: {
        minSuccessRate: 98,
        maxErrorRate: 1,
        maxResponseTime: 2000
      },
      duration: 30
    },
    {
      id: 'staged',
      name: 'Staged Release',
      description: 'Deploy to 25% of users for scaled validation',
      userPercentage: 25,
      successCriteria: {
        minSuccessRate: 97,
        maxErrorRate: 2,
        maxResponseTime: 2500
      },
      duration: 60
    },
    {
      id: 'full',
      name: 'Full Release',
      description: 'Deploy to 100% of users',
      userPercentage: 100,
      successCriteria: {
        minSuccessRate: 95,
        maxErrorRate: 3,
        maxResponseTime: 3000
      },
      duration: 0 // No time limit for full release
    }
  ]);

  const [rolloutStatus, setRolloutStatus] = useState<RolloutStatus>({
    currentStage: 0,
    status: 'not_started',
    metrics: {
      successRate: 0,
      errorRate: 0,
      avgResponseTime: 0,
      usersFailed: 0,
      usersSucceeded: 0
    }
  });

  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const simulateMetrics = () => {
    const currentStage = rolloutStages[rolloutStatus.currentStage];
    if (!currentStage) return;

    // Simulate realistic metrics with some variance
    const baseSuccessRate = 96 + Math.random() * 3;
    const baseErrorRate = 0.5 + Math.random() * 1.5;
    const baseResponseTime = 1000 + Math.random() * 1000;
    
    // Add some "issues" for testing rollback scenarios
    const hasIssues = Math.random() < 0.1; // 10% chance of issues
    
    const metrics = {
      successRate: hasIssues ? baseSuccessRate - 5 : baseSuccessRate,
      errorRate: hasIssues ? baseErrorRate + 3 : baseErrorRate,
      avgResponseTime: hasIssues ? baseResponseTime + 2000 : baseResponseTime,
      usersFailed: Math.floor(Math.random() * 10),
      usersSucceeded: Math.floor(Math.random() * 100)
    };

    setRolloutStatus(prev => ({
      ...prev,
      metrics
    }));

    // Check if stage criteria are met
    checkStageCriteria(currentStage, metrics);
  };

  const checkStageCriteria = (stage: RolloutStage, metrics: RolloutStatus['metrics']) => {
    const criteriaMet = 
      metrics.successRate >= stage.successCriteria.minSuccessRate &&
      metrics.errorRate <= stage.successCriteria.maxErrorRate &&
      metrics.avgResponseTime <= stage.successCriteria.maxResponseTime;

    if (!criteriaMet) {
      // Criteria not met - consider rollback
      const criticalFailure = 
        metrics.successRate < (stage.successCriteria.minSuccessRate - 5) ||
        metrics.errorRate > (stage.successCriteria.maxErrorRate * 2) ||
        metrics.avgResponseTime > (stage.successCriteria.maxResponseTime * 1.5);

      if (criticalFailure) {
        rollback();
        return;
      }
    }

    // Check if stage duration has passed and criteria are met
    if (rolloutStatus.stageStartTime && criteriaMet) {
      const stageElapsed = Date.now() - rolloutStatus.stageStartTime.getTime();
      const stageDurationMs = stage.duration * 60 * 1000;

      if (stageElapsed >= stageDurationMs) {
        if (rolloutStatus.currentStage < rolloutStages.length - 1) {
          proceedToNextStage();
        } else {
          completeRollout();
        }
      }
    }
  };

  const startRollout = () => {
    setRolloutStatus({
      currentStage: 0,
      status: 'running',
      startTime: new Date(),
      stageStartTime: new Date(),
      metrics: {
        successRate: 0,
        errorRate: 0,
        avgResponseTime: 0,
        usersFailed: 0,
        usersSucceeded: 0
      }
    });

    // Start metrics simulation
    const interval = setInterval(simulateMetrics, 5000); // Update every 5 seconds
    setSimulationInterval(interval);

    toast({
      title: "Rollout Started",
      description: `Beginning ${rolloutStages[0].name}`,
      variant: "default"
    });
  };

  const pauseRollout = () => {
    setRolloutStatus(prev => ({
      ...prev,
      status: 'paused'
    }));

    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }

    toast({
      title: "Rollout Paused",
      description: "Deployment has been paused for review",
      variant: "default"
    });
  };

  const resumeRollout = () => {
    setRolloutStatus(prev => ({
      ...prev,
      status: 'running'
    }));

    const interval = setInterval(simulateMetrics, 5000);
    setSimulationInterval(interval);

    toast({
      title: "Rollout Resumed",
      description: "Deployment has been resumed",
      variant: "default"
    });
  };

  const proceedToNextStage = () => {
    const nextStage = rolloutStatus.currentStage + 1;
    
    setRolloutStatus(prev => ({
      ...prev,
      currentStage: nextStage,
      stageStartTime: new Date()
    }));

    toast({
      title: "Stage Advanced",
      description: `Proceeding to ${rolloutStages[nextStage]?.name}`,
      variant: "default"
    });
  };

  const rollback = () => {
    setRolloutStatus(prev => ({
      ...prev,
      status: 'rolled_back'
    }));

    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }

    toast({
      title: "Rollback Initiated",
      description: "Deployment has been rolled back due to performance issues",
      variant: "destructive"
    });
  };

  const completeRollout = () => {
    setRolloutStatus(prev => ({
      ...prev,
      status: 'completed'
    }));

    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }

    toast({
      title: "Rollout Complete! 🎉",
      description: "Deployment has been successfully rolled out to all users",
      variant: "default"
    });
  };

  const resetRollout = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }

    setRolloutStatus({
      currentStage: 0,
      status: 'not_started',
      metrics: {
        successRate: 0,
        errorRate: 0,
        avgResponseTime: 0,
        usersFailed: 0,
        usersSucceeded: 0
      }
    });

    toast({
      title: "Rollout Reset",
      description: "Rollout has been reset to initial state",
      variant: "default"
    });
  };

  const getStageStatus = (stageIndex: number) => {
    if (stageIndex < rolloutStatus.currentStage) return 'completed';
    if (stageIndex === rolloutStatus.currentStage) {
      return rolloutStatus.status === 'running' ? 'active' : rolloutStatus.status;
    }
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      running: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      rolled_back: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const currentStage = rolloutStages[rolloutStatus.currentStage];
  const totalProgress = rolloutStatus.status === 'completed' ? 100 : 
    (rolloutStatus.currentStage / rolloutStages.length) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Gradual Rollout Control
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Deploy changes gradually with automated monitoring and rollback
          </p>
        </div>
        <div className="flex gap-2">
          {rolloutStatus.status === 'not_started' && (
            <Button onClick={startRollout} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Rollout
            </Button>
          )}
          {rolloutStatus.status === 'running' && (
            <>
              <Button variant="outline" onClick={pauseRollout}>
                <Pause className="h-4 w-4" />
              </Button>
              <Button variant="destructive" onClick={rollback}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
          {rolloutStatus.status === 'paused' && (
            <>
              <Button onClick={resumeRollout}>
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="destructive" onClick={rollback}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
          {(rolloutStatus.status === 'completed' || rolloutStatus.status === 'rolled_back') && (
            <Button variant="outline" onClick={resetRollout}>
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{totalProgress.toFixed(0)}%</span>
          </div>
          <Progress value={totalProgress} />
        </div>

        {/* Current Stage Metrics */}
        {rolloutStatus.status === 'running' && currentStage && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Stage: {currentStage.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{rolloutStatus.metrics.successRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                  <div className="text-xs text-gray-500">Target: {currentStage.successCriteria.minSuccessRate}%+</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{rolloutStatus.metrics.errorRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Error Rate</div>
                  <div className="text-xs text-gray-500">Target: &lt;{currentStage.successCriteria.maxErrorRate}%</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{rolloutStatus.metrics.avgResponseTime.toFixed(0)}ms</div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                  <div className="text-xs text-gray-500">Target: &lt;{currentStage.successCriteria.maxResponseTime}ms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentStage.userPercentage}%</div>
                  <div className="text-xs text-muted-foreground">User Coverage</div>
                  <div className="text-xs text-gray-500">
                    {rolloutStatus.metrics.usersSucceeded + rolloutStatus.metrics.usersFailed} users
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rollout Stages */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Rollout Stages
          </h4>
          {rolloutStages.map((stage, index) => {
            const stageStatus = getStageStatus(index);
            return (
              <div key={stage.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-mono">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{stage.name}</span>
                      <Badge className={getStatusColor(stageStatus)} variant="secondary">
                        {stageStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stage.userPercentage}% of users • {stage.duration > 0 ? `${stage.duration} min duration` : 'No time limit'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Success: {stage.successCriteria.minSuccessRate}%+
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Errors: &lt;{stage.successCriteria.maxErrorRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Response: &lt;{stage.successCriteria.maxResponseTime}ms
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Alerts */}
        {rolloutStatus.status === 'rolled_back' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Rollout was automatically rolled back due to performance issues. Review the metrics and fix issues before attempting another deployment.
            </AlertDescription>
          </Alert>
        )}

        {rolloutStatus.status === 'completed' && (
          <Alert className="border-green-200 bg-green-50">
            <Rocket className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Rollout completed successfully! The new version is now deployed to all users.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
