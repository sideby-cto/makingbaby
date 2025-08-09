
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestError, TestMetrics } from '@/types/chaos-testing';
import { 
  AlertTriangle, 
  Bug, 
  Shield, 
  Zap, 
  Search, 
  Filter,
  Download,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';
import { BusinessIssueCard } from './BusinessIssueCard';

interface TestResultsViewProps {
  errors: TestError[];
  metrics: TestMetrics;
  isBusinessView?: boolean;
}

export const TestResultsView = ({ errors, metrics, isBusinessView = false }: TestResultsViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<TestError | null>(null);

  // Filter errors based on search and filters
  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || error.severity === severityFilter;
    const matchesType = typeFilter === 'all' || error.type === typeFilter;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  // Group errors by type
  const errorsByType = filteredErrors.reduce((acc, error) => {
    if (!acc[error.type]) acc[error.type] = [];
    acc[error.type].push(error);
    return acc;
  }, {} as Record<string, TestError[]>);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <Bug className="h-4 w-4" />;
      case 'vulnerability': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'dead_end': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'vulnerability': return 'text-purple-600 bg-purple-50';
      case 'performance': return 'text-orange-600 bg-orange-50';
      case 'dead_end': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const copyErrorDetails = (error: TestError) => {
    const details = `
Error: ${error.description}
Location: ${error.location}
Severity: ${error.severity}
Type: ${error.type}
Time: ${error.timestamp.toISOString()}

Reproduction Steps:
${error.reproductionSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

${error.stackTrace ? `Stack Trace:\n${error.stackTrace}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(details);
  };

  const exportResults = () => {
    const data = {
      metrics,
      errors: errors.map(error => ({
        ...error,
        timestamp: error.timestamp.toISOString()
      })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaos-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (errors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-green-600 mb-4">
            <Shield className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
          <p className="text-muted-foreground text-center">
            Great! The chaos testing didn't discover any issues. 
            Your application appears to be handling various scenarios well.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <div className="text-2xl font-bold">{errorsByType.error?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Vulnerabilities</span>
            </div>
            <div className="text-2xl font-bold">{errorsByType.vulnerability?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="text-2xl font-bold">{errorsByType.performance?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Dead Ends</span>
            </div>
            <div className="text-2xl font-bold">{errorsByType.dead_end?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                {filteredErrors.length} of {errors.length} issues shown
              </CardDescription>
            </div>
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="vulnerability">Vulnerabilities</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="dead_end">Dead Ends</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Tabs */}
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grouped">Grouped</TabsTrigger>
              {isBusinessView && <TabsTrigger value="business">Business Impact</TabsTrigger>}
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {filteredErrors.map((error) => (
                <Card key={error.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${getTypeColor(error.type)}`}>
                          {getTypeIcon(error.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{error.description}</h4>
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{error.location}</p>
                          <p className="text-xs text-muted-foreground">
                            {error.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyErrorDetails(error)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedError(error)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {selectedError?.id === error.id && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-2">Reproduction Steps:</h5>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mb-4">
                          {error.reproductionSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                        
                        {error.stackTrace && (
                          <div>
                            <h5 className="font-medium mb-2">Stack Trace:</h5>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                              {error.stackTrace}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="grouped" className="space-y-6">
              {Object.entries(errorsByType).map(([type, typeErrors]) => (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      {type.replace('_', ' ').toUpperCase()} ({typeErrors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {typeErrors.map((error) => (
                      <div key={error.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{error.description}</p>
                          <p className="text-sm text-muted-foreground">{error.location}</p>
                        </div>
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {isBusinessView && (
              <TabsContent value="business" className="space-y-4">
                {filteredErrors
                  .filter(error => error.businessImpact)
                  .map((error) => (
                    <BusinessIssueCard key={error.id} error={error} />
                  ))}
                
                {filteredErrors.filter(error => error.businessImpact).length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Business Impact Analysis</h3>
                      <p className="text-muted-foreground text-center">
                        Generate business insights to see the impact analysis for discovered issues.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
