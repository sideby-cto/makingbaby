import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, BookOpen, Target, TrendingUp } from "lucide-react";

interface LearningProgressionAnalyticsProps {
  analytics: any;
  loading: boolean;
  timeRange: string;
}

export const LearningProgressionAnalytics: React.FC<LearningProgressionAnalyticsProps> = ({
  analytics,
  loading,
  timeRange
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const funnelData = analytics?.completionFunnels || [];
  const skillData = analytics?.skillAcquisition || [];
  const pathData = analytics?.learningPaths || [];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Learning Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Completion Rate
            </CardTitle>
            <Award className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.overallCompletion?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Avg Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              67%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Across all learning paths
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Active Learners
            </CardTitle>
            <BookOpen className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              2,847
            </div>
            <p className="text-xs text-semantic-text-muted">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Skill Mastery
            </CardTitle>
            <Target className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              78%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Average across skills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-semantic-text-primary">Learning Journey Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                dataKey="step" 
                type="category" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="completed" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
                name="Completed"
              />
              <Bar 
                dataKey="dropped" 
                fill="hsl(var(--muted))" 
                radius={[0, 4, 4, 0]}
                name="Dropped"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skill Acquisition */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Skill Proficiency Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="skill" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar 
                  dataKey="proficiency" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Learning Path Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pathData.map((path, index) => (
                <div key={path.path} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-semantic-text-primary">
                      {path.path}
                    </span>
                    <span className="text-sm text-semantic-text-secondary">
                      {path.users} users • {path.completion}% completion
                    </span>
                  </div>
                  <div className="w-full bg-semantic-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${path.completion}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Top Performing Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillData
                .sort((a, b) => b.proficiency - a.proficiency)
                .slice(0, 3)
                .map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <span className="text-sm text-semantic-text-secondary">
                    {index + 1}. {skill.skill}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-semantic-text-primary">
                      {skill.proficiency}%
                    </span>
                    <span className={`text-xs ${skill.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {skill.trend > 0 ? '+' : ''}{skill.trend}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Learning Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary text-sm mb-1">
                  Progress Pattern
                </h4>
                <p className="text-xs text-semantic-text-secondary">
                  Most learners progress 23% faster when paired with mentors
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary text-sm mb-1">
                  Drop-off Analysis
                </h4>
                <p className="text-xs text-semantic-text-secondary">
                  15% drop-off occurs at intermediate skill levels
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary text-sm mb-1">
                  Completion Factors
                </h4>
                <p className="text-xs text-semantic-text-secondary">
                  Regular feedback increases completion by 34%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Skill Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillData.map((skill) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <span className="text-sm text-semantic-text-secondary">
                    {skill.skill}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-semantic-border rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full" 
                        style={{ width: `${(skill.proficiency / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${skill.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {skill.trend > 0 ? '↗' : '↘'} {Math.abs(skill.trend)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};