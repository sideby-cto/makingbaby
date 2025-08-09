import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, CheckCircle, AlertTriangle, XCircle, 
  Eye, RefreshCw, AlertCircle, FileText 
} from 'lucide-react';

interface QualityAssuranceProps {
  timeframe: string;
  experimentType: string;
}

export const QualityAssurance: React.FC<QualityAssuranceProps> = ({
  timeframe,
  experimentType
}) => {
  const [activeQATab, setActiveQATab] = useState("validation");

  // Mock data for quality assurance
  const qualityMetrics = {
    overallScore: 94.2,
    dataIntegrity: 97.8,
    protocolCompliance: 91.5,
    participantConsent: 99.1,
    statisticalValidity: 89.7
  };

  const validationChecks = [
    {
      id: '1',
      name: 'Data Completeness Check',
      status: 'passed',
      score: 98.5,
      issues: 0,
      description: 'All required data fields are populated',
      lastRun: '2024-01-20 14:30'
    },
    {
      id: '2',
      name: 'Statistical Power Analysis',
      status: 'warning',
      score: 87.2,
      issues: 2,
      description: 'Sample size may be insufficient for some subgroups',
      lastRun: '2024-01-20 14:25'
    },
    {
      id: '3',
      name: 'Consent Documentation',
      status: 'passed',
      score: 99.8,
      issues: 0,
      description: 'All participants have valid consent forms',
      lastRun: '2024-01-20 14:20'
    },
    {
      id: '4',
      name: 'Protocol Adherence Review',
      status: 'failed',
      score: 76.3,
      issues: 5,
      description: 'Some deviations from experimental protocol detected',
      lastRun: '2024-01-20 14:15'
    }
  ];

  const auditTrail = [
    {
      id: '1',
      action: 'Experiment Configuration Updated',
      user: 'Dr. Sarah Chen',
      timestamp: '2024-01-20 15:45',
      details: 'Modified participant inclusion criteria',
      impact: 'medium'
    },
    {
      id: '2',
      action: 'Data Export Performed',
      user: 'Research Assistant',
      timestamp: '2024-01-20 14:30',
      details: 'Exported participant data for analysis',
      impact: 'low'
    },
    {
      id: '3',
      action: 'Protocol Deviation Reported',
      user: 'Dr. Michael Johnson',
      timestamp: '2024-01-20 13:15',
      details: 'Participant missed scheduled session',
      impact: 'high'
    }
  ];

  const complianceIssues = [
    {
      id: '1',
      type: 'Protocol Deviation',
      severity: 'high',
      experiment: 'Learning Focus Study',
      description: 'Participant received intervention out of sequence',
      reportedBy: 'Automated Monitor',
      status: 'under_review'
    },
    {
      id: '2',
      type: 'Data Quality',
      severity: 'medium',
      experiment: 'Hat Detection A/B',
      description: 'Missing baseline assessment for 3 participants',
      reportedBy: 'Dr. Sarah Chen',
      status: 'resolved'
    },
    {
      id: '3',
      type: 'Consent Issue',
      severity: 'low',
      experiment: 'Stance Analysis Test',
      description: 'Consent form version mismatch for 1 participant',
      reportedBy: 'Ethics Review Board',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-semantic-success';
      case 'warning': return 'bg-semantic-warning';
      case 'failed': return 'bg-semantic-error';
      default: return 'bg-semantic-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-semantic-error';
      case 'medium': return 'bg-semantic-warning';
      case 'low': return 'bg-semantic-info';
      default: return 'bg-semantic-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Overall Quality Score
            </CardTitle>
            <Shield className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {qualityMetrics.overallScore}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Above target threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Data Integrity
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {qualityMetrics.dataIntegrity}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Excellent compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Protocol Adherence
            </CardTitle>
            <FileText className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {qualityMetrics.protocolCompliance}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Minor deviations noted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Consent Coverage
            </CardTitle>
            <Eye className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {qualityMetrics.participantConsent}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Nearly complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Statistical Validity
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {qualityMetrics.statisticalValidity}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Assurance Details */}
      <Tabs value={activeQATab} onValueChange={setActiveQATab}>
        <TabsList>
          <TabsTrigger value="validation">Validation Checks</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Issues</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-semantic-text-primary">
                  Automated Validation Checks
                </CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run All Checks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationChecks.map((check) => (
                  <div key={check.id} className="p-4 border border-semantic-border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-semantic-text-primary">
                            {check.name}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(check.status)} text-white`}
                          >
                            <div className="flex items-center gap-1">
                              {getStatusIcon(check.status)}
                              {check.status}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-semantic-text-secondary">
                          {check.description}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-semantic-text-primary font-medium">
                          {check.score}%
                        </div>
                        <div className="text-semantic-text-muted">
                          {check.issues} issues
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-semantic-text-secondary">Validation Score</span>
                        <span className="text-semantic-text-primary font-medium">
                          {check.score}%
                        </span>
                      </div>
                      <Progress value={check.score} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-semantic-border text-xs text-semantic-text-muted">
                      <span>Last run: {check.lastRun}</span>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-semantic-text-primary">
                Compliance Issues & Resolutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceIssues.map((issue) => (
                  <Alert key={issue.id}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{issue.type}</span>
                            <Badge 
                              variant="secondary" 
                              className={`${getSeverityColor(issue.severity)} text-white text-xs`}
                            >
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {issue.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-semantic-text-secondary">
                            <strong>{issue.experiment}:</strong> {issue.description}
                          </p>
                          <p className="text-xs text-semantic-text-muted">
                            Reported by: {issue.reportedBy}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-semantic-text-primary">
                Audit Trail & Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditTrail.map((entry) => (
                  <div key={entry.id} className="p-4 border border-semantic-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-semantic-text-primary">
                          {entry.action}
                        </h3>
                        <p className="text-sm text-semantic-text-secondary">
                          {entry.details}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-semantic-text-muted">
                          <span>By: {entry.user}</span>
                          <span>At: {entry.timestamp}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          entry.impact === 'high' ? 'border-semantic-error text-semantic-error' :
                          entry.impact === 'medium' ? 'border-semantic-warning text-semantic-warning' :
                          'border-semantic-info text-semantic-info'
                        }`}
                      >
                        {entry.impact} impact
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};