import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, TrendingUp, Users, Target, 
  Clock, CheckCircle, AlertTriangle 
} from 'lucide-react';

interface ExperimentOverviewProps {
  timeframe: string;
  experimentType: string;
}

export const ExperimentOverview: React.FC<ExperimentOverviewProps> = ({
  timeframe,
  experimentType
}) => {
  // Mock data - replace with real data fetching
  const activeExperiments = [
    {
      id: '1',
      name: 'Hat Detection Accuracy Study',
      type: 'hat_detection',
      status: 'active',
      participants: 145,
      progress: 68,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      successRate: 92.3,
      hypothesis: 'Improved model accuracy through enhanced training data'
    },
    {
      id: '2', 
      name: 'Learning Focus Optimization',
      type: 'learning_focus',
      status: 'active',
      participants: 89,
      progress: 45,
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      successRate: 87.1,
      hypothesis: 'Personalized learning paths increase engagement'
    },
    {
      id: '3',
      name: 'Stance Analysis Enhancement',
      type: 'stance',
      status: 'analyzing',
      participants: 234,
      progress: 100,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      successRate: 94.7,
      hypothesis: 'Multi-modal analysis improves stance detection'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-semantic-success';
      case 'analyzing': return 'bg-semantic-warning';
      case 'completed': return 'bg-semantic-primary';
      default: return 'bg-semantic-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'analyzing': return <TrendingUp className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Experiments This Period
            </CardTitle>
            <Target className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {activeExperiments.length}
            </div>
            <p className="text-xs text-semantic-text-muted">
              2 active, 1 in analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {activeExperiments.reduce((sum, exp) => sum + exp.participants, 0)}
            </div>
            <p className="text-xs text-semantic-text-muted">
              Across all active experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Average Success Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {(activeExperiments.reduce((sum, exp) => sum + exp.successRate, 0) / activeExperiments.length).toFixed(1)}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Above baseline expectations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Experiments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-semantic-text-primary">
            Active Experiments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeExperiments.map((experiment) => (
              <div key={experiment.id} className="p-4 border border-semantic-border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-semantic-text-primary">
                        {experiment.name}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(experiment.status)} text-white`}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(experiment.status)}
                          {experiment.status}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-semantic-text-secondary">
                      {experiment.hypothesis}
                    </p>
                  </div>
                  <div className="text-right text-sm text-semantic-text-muted">
                    <div className="flex items-center gap-1 mb-1">
                      <Users className="h-3 w-3" />
                      {experiment.participants} participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {experiment.startDate} - {experiment.endDate}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-semantic-text-secondary">Progress</span>
                    <span className="text-semantic-text-primary font-medium">
                      {experiment.progress}%
                    </span>
                  </div>
                  <Progress value={experiment.progress} className="h-2" />
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-semantic-border">
                  <span className="text-sm text-semantic-text-secondary">
                    Success Rate: <span className="font-medium text-semantic-text-primary">
                      {experiment.successRate}%
                    </span>
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {experiment.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experiment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-semantic-text-primary">
            Experiment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              {/* Timeline visualization would go here */}
              <div className="text-center py-8 text-semantic-text-muted">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Timeline visualization coming soon</p>
                <p className="text-xs">Interactive experiment scheduling and progress tracking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};