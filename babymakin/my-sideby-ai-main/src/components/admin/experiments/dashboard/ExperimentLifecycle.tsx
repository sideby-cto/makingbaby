import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, Pause, RotateCcw, CheckCircle, 
  Clock, AlertTriangle, Calendar, Users 
} from 'lucide-react';

interface ExperimentLifecycleProps {
  timeframe: string;
  experimentType: string;
}

export const ExperimentLifecycle: React.FC<ExperimentLifecycleProps> = ({
  timeframe,
  experimentType
}) => {
  const [selectedStage, setSelectedStage] = useState("all");

  // Mock data for experiment lifecycle
  const lifecycleStages = [
    { stage: 'planning', label: 'Planning', count: 5, color: 'bg-semantic-primary' },
    { stage: 'recruiting', label: 'Recruiting', count: 3, color: 'bg-semantic-warning' },
    { stage: 'active', label: 'Active', count: 12, color: 'bg-semantic-success' },
    { stage: 'analyzing', label: 'Analyzing', count: 7, color: 'bg-semantic-info' },
    { stage: 'completed', label: 'Completed', count: 23, color: 'bg-semantic-muted' }
  ];

  const experiments = [
    {
      id: '1',
      name: 'Adaptive Learning Pathways',
      stage: 'active',
      progress: 68,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      participants: 145,
      plannedParticipants: 150,
      hypothesis: 'Personalized learning paths improve student engagement',
      status: 'on_track',
      nextMilestone: 'Mid-point data collection',
      daysRemaining: 12
    },
    {
      id: '2',
      name: 'Collaborative Problem Solving',
      stage: 'recruiting',
      progress: 25,
      startDate: '2024-02-01',
      endDate: '2024-03-01',
      participants: 87,
      plannedParticipants: 120,
      hypothesis: 'Group work enhances learning outcomes',
      status: 'behind',
      nextMilestone: 'Reach minimum participant threshold',
      daysRemaining: 25
    },
    {
      id: '3',
      name: 'AI-Assisted Feedback Systems',
      stage: 'analyzing',
      progress: 100,
      startDate: '2023-12-01',
      endDate: '2024-01-01',
      participants: 203,
      plannedParticipants: 200,
      hypothesis: 'AI feedback improves learning speed',
      status: 'completed',
      nextMilestone: 'Final report generation',
      daysRemaining: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-semantic-success';
      case 'behind': return 'bg-semantic-warning';
      case 'at_risk': return 'bg-semantic-error';
      case 'completed': return 'bg-semantic-primary';
      default: return 'bg-semantic-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle className="h-4 w-4" />;
      case 'behind': return <Clock className="h-4 w-4" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'planning': return <Calendar className="h-4 w-4" />;
      case 'recruiting': return <Users className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'analyzing': return <RotateCcw className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredExperiments = selectedStage === "all" 
    ? experiments 
    : experiments.filter(exp => exp.stage === selectedStage);

  return (
    <div className="space-y-6">
      {/* Lifecycle Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        {lifecycleStages.map((stage) => (
          <Card key={stage.stage}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-semantic-text-secondary">
                {stage.label}
              </CardTitle>
              {getStageIcon(stage.stage)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-semantic-text-primary">
                {stage.count}
              </div>
              <p className="text-xs text-semantic-text-muted">
                experiments
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stage Filter */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-semantic-text-primary">
              Experiment Lifecycle Management
            </CardTitle>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="recruiting">Recruiting</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExperiments.map((experiment) => (
              <div key={experiment.id} className="p-4 border border-semantic-border rounded-lg space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-semantic-text-primary">
                        {experiment.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {experiment.stage}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(experiment.status)} text-white`}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(experiment.status)}
                          {experiment.status.replace('_', ' ')}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-semantic-text-secondary">
                      {experiment.hypothesis}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-semantic-text-primary font-medium">
                      {experiment.daysRemaining > 0 ? `${experiment.daysRemaining} days left` : 'Completed'}
                    </div>
                    <div className="text-semantic-text-muted">
                      {experiment.startDate} - {experiment.endDate}
                    </div>
                  </div>
                </div>

                {/* Progress and Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-semantic-text-secondary">Timeline Progress</span>
                      <span className="text-semantic-text-primary font-medium">
                        {experiment.progress}%
                      </span>
                    </div>
                    <Progress value={experiment.progress} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-semantic-text-secondary">Participant Recruitment</span>
                      <span className="text-semantic-text-primary font-medium">
                        {experiment.participants}/{experiment.plannedParticipants}
                      </span>
                    </div>
                    <Progress 
                      value={(experiment.participants / experiment.plannedParticipants) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>

                {/* Next Milestone */}
                <div className="flex justify-between items-center pt-2 border-t border-semantic-border">
                  <div className="text-sm">
                    <span className="text-semantic-text-secondary">Next Milestone: </span>
                    <span className="text-semantic-text-primary font-medium">
                      {experiment.nextMilestone}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {experiment.stage === 'active' && (
                      <Button variant="outline" size="sm">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    {experiment.stage === 'recruiting' && (
                      <Button size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Timeline */}
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
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Interactive timeline visualization coming soon</p>
                <p className="text-xs">Track experiment milestones and dependencies</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};