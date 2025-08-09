import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RoleBasedRecommendations as RoleRecommendations } from '@/types/chaos-testing';
import { 
  Code2, 
  Target, 
  Palette, 
  Bug, 
  Crown,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface RoleBasedRecommendationsProps {
  recommendations: RoleRecommendations;
}

export const RoleBasedRecommendations = ({ recommendations }: RoleBasedRecommendationsProps) => {
  const roles = [
    {
      key: 'developer' as keyof RoleRecommendations,
      label: 'Developer',
      icon: <Code2 className="h-4 w-4" />,
      color: 'bg-blue-500',
      description: 'Technical implementation and fixes'
    },
    {
      key: 'productManager' as keyof RoleRecommendations,
      label: 'Product Manager', 
      icon: <Target className="h-4 w-4" />,
      color: 'bg-green-500',
      description: 'Product strategy and user experience'
    },
    {
      key: 'designer' as keyof RoleRecommendations,
      label: 'Designer',
      icon: <Palette className="h-4 w-4" />,
      color: 'bg-purple-500',
      description: 'User interface and experience design'
    },
    {
      key: 'qa' as keyof RoleRecommendations,
      label: 'QA Engineer',
      icon: <Bug className="h-4 w-4" />,
      color: 'bg-orange-500',
      description: 'Quality assurance and testing'
    },
    {
      key: 'executive' as keyof RoleRecommendations,
      label: 'Executive',
      icon: <Crown className="h-4 w-4" />,
      color: 'bg-red-500',
      description: 'Strategic decisions and resource allocation'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role-Based Action Items</CardTitle>
        <CardDescription>
          Tailored recommendations for each team member based on their role and responsibilities
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="developer" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {roles.map((role) => (
              <TabsTrigger key={role.key} value={role.key} className="text-xs">
                <div className="flex items-center gap-1">
                  {role.icon}
                  <span className="hidden sm:inline">{role.label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {roles.map((role) => (
            <TabsContent key={role.key} value={role.key} className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role.color} text-white`}>
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{role.label}</h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {recommendations[role.key].length > 0 ? (
                    recommendations[role.key].map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm">{recommendation}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm text-muted-foreground">
                        No specific action items for this role based on current findings.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Pro Tip:</strong> Collaborate with other teams to ensure comprehensive 
                    issue resolution and prevent similar problems in the future.
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};