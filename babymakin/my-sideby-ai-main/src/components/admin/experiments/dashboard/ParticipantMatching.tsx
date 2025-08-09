import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Users, Search, UserCheck, UserX, 
  Target, Brain, Filter, RefreshCw 
} from 'lucide-react';

interface ParticipantMatchingProps {
  timeframe: string;
  experimentType: string;
}

export const ParticipantMatching: React.FC<ParticipantMatchingProps> = ({
  timeframe,
  experimentType
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  // Mock data for participant pools
  const participantPools = [
    {
      id: '1',
      name: 'Math Teachers - Middle School',
      size: 234,
      criteria: ['subject:math', 'level:middle_school', 'experience:3-8_years'],
      matchRate: 92.3,
      activeExperiments: 3,
      description: 'Experienced middle school mathematics educators'
    },
    {
      id: '2',
      name: 'Science Educators - High School',
      size: 189,
      criteria: ['subject:science', 'level:high_school', 'certification:physics'],
      matchRate: 87.6,
      activeExperiments: 2,
      description: 'High school science teachers with physics specialization'
    },
    {
      id: '3',
      name: 'Elementary Generalists',
      size: 412,
      criteria: ['level:elementary', 'type:generalist', 'experience:any'],
      matchRate: 94.1,
      activeExperiments: 5,
      description: 'Elementary school teachers across all subjects'
    }
  ];

  const matchingCriteria = [
    { key: 'teaching_experience', label: 'Teaching Experience', count: 892 },
    { key: 'subject_specialization', label: 'Subject Area', count: 756 },
    { key: 'student_grade_level', label: 'Grade Level', count: 623 },
    { key: 'professional_development', label: 'Professional Development', count: 445 },
    { key: 'technology_adoption', label: 'Technology Use', count: 334 },
    { key: 'teaching_methodology', label: 'Teaching Style', count: 298 }
  ];

  const filteredPools = participantPools.filter(pool =>
    pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Matching Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {participantPools.reduce((sum, pool) => sum + pool.size, 0)}
            </div>
            <p className="text-xs text-semantic-text-muted">
              Across all pools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Active Pools
            </CardTitle>
            <Target className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {participantPools.length}
            </div>
            <p className="text-xs text-semantic-text-muted">
              Ready for matching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Match Success Rate
            </CardTitle>
            <UserCheck className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {(participantPools.reduce((sum, pool) => sum + pool.matchRate, 0) / participantPools.length).toFixed(1)}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Average across pools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Matching Criteria
            </CardTitle>
            <Brain className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {matchingCriteria.length}
            </div>
            <p className="text-xs text-semantic-text-muted">
              Available attributes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-semantic-text-primary">
            Participant Pool Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-semantic-text-muted" />
              <Input
                placeholder="Search participant pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {filteredPools.map((pool) => (
              <div key={pool.id} className="p-4 border border-semantic-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h3 className="font-medium text-semantic-text-primary">
                      {pool.name}
                    </h3>
                    <p className="text-sm text-semantic-text-secondary">
                      {pool.description}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-semantic-text-primary font-medium">
                      {pool.size} participants
                    </div>
                    <div className="text-semantic-text-muted">
                      {pool.activeExperiments} active experiments
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {pool.criteria.map((criterion, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {criterion}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-semantic-text-secondary">Match Success Rate</span>
                    <span className="text-semantic-text-primary font-medium">
                      {pool.matchRate}%
                    </span>
                  </div>
                  <Progress value={pool.matchRate} className="h-2" />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    Create Experiment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matching Criteria Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-semantic-text-primary">
            Matching Criteria Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {matchingCriteria.map((criterion) => (
              <div key={criterion.key} className="p-3 border border-semantic-border rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-semantic-text-primary">
                    {criterion.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {criterion.count} users
                  </Badge>
                </div>
                <div className="text-sm text-semantic-text-muted">
                  Effective for targeted experiment matching
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};