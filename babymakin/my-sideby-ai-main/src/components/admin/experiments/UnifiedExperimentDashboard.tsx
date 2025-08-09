import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, BarChart3, Target, Clock, TrendingUp, 
  Filter, RefreshCw, Download, Settings 
} from 'lucide-react';
import { ExperimentOverview } from './dashboard/ExperimentOverview';
import { ParticipantMatching } from './dashboard/ParticipantMatching';
import { StudentSuccessAttribution } from './dashboard/StudentSuccessAttribution';
import { ExperimentLifecycle } from './dashboard/ExperimentLifecycle';
import { DataVisualization } from './dashboard/DataVisualization';
import { QualityAssurance } from './dashboard/QualityAssurance';

interface UnifiedExperimentDashboardProps {
  className?: string;
}

export const UnifiedExperimentDashboard: React.FC<UnifiedExperimentDashboardProps> = ({ 
  className = "" 
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedExperimentType, setSelectedExperimentType] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const handleRefresh = () => {
    // Trigger refresh across all components
    window.location.reload();
  };

  const handleExport = () => {
    // Implement data export functionality
    console.log('Exporting experiment data...');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-lg font-bold text-semantic-text-primary">
            Experiment Analytics Hub
          </h1>
          <p className="text-body-md text-semantic-text-secondary">
            Comprehensive experiment management and insights platform
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedExperimentType} onValueChange={setSelectedExperimentType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experiments</SelectItem>
              <SelectItem value="stance">Stance Analysis</SelectItem>
              <SelectItem value="hat_detection">Hat Detection</SelectItem>
              <SelectItem value="learning_focus">Learning Focus</SelectItem>
              <SelectItem value="teaching_focus">Teaching Focus</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Active Experiments
            </CardTitle>
            <Target className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">24</div>
            <p className="text-xs text-semantic-text-muted">
              +3 from last month
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
            <div className="text-2xl font-bold text-semantic-text-primary">1,423</div>
            <p className="text-xs text-semantic-text-muted">
              +12% participation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Success Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">87.3%</div>
            <p className="text-xs text-semantic-text-muted">
              +5.2% vs baseline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Avg Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">14.2d</div>
            <p className="text-xs text-semantic-text-muted">
              Optimal experiment length
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matching">Participant Matching</TabsTrigger>
          <TabsTrigger value="success">Success Attribution</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="quality">Quality Assurance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <ExperimentOverview 
            timeframe={selectedTimeframe}
            experimentType={selectedExperimentType}
          />
        </TabsContent>
        
        <TabsContent value="matching" className="mt-6">
          <ParticipantMatching 
            timeframe={selectedTimeframe}
            experimentType={selectedExperimentType}
          />
        </TabsContent>
        
        <TabsContent value="success" className="mt-6">
          <StudentSuccessAttribution 
            timeframe={selectedTimeframe}
            experimentType={selectedExperimentType}
          />
        </TabsContent>
        
        <TabsContent value="lifecycle" className="mt-6">
          <ExperimentLifecycle 
            timeframe={selectedTimeframe}
            experimentType={selectedExperimentType}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <DataVisualization 
            timeframe={selectedTimeframe}
            experimentType={selectedExperimentType}
          />
        </TabsContent>
        
        <TabsContent value="quality" className="mt-6">
          <QualityAssurance 
            timeframe={selectedTimeframe}
            experimentType={selectedExperimentType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};