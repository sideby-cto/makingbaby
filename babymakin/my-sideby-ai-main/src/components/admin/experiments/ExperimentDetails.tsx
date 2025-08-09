
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExperimentDetailsProps {
  experimentId: string;
}

interface ExperimentData {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  variant_a_name: string;
  variant_b_name: string;
  created_at: string;
  participants: any[];
}

export const ExperimentDetails = ({ experimentId }: ExperimentDetailsProps) => {
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExperimentDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch experiment details from posts table since saved_items was removed
        const { data: expData, error: expError } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            created_at,
            type,
            metadata,
            profiles (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('type', 'ai_trick')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10);

        if (expError) {
          console.error('Error fetching experiment:', expError);
          return;
        }

        if (expData && expData.length > 0) {
          // Mock experiment data structure
          const mockExperiment: ExperimentData = {
            id: experimentId,
            name: experimentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Experiment tracking ${experimentId} variants`,
            status: 'active',
            start_date: expData[0].created_at,
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            variant_a_name: 'Control',
            variant_b_name: 'Variant',
            created_at: expData[0].created_at,
            participants: expData.map(post => ({
              profiles: post.profiles,
              variant: Math.random() > 0.5 ? 'A' : 'B'
            }))
          };
          
          setExperiment(mockExperiment);
        }
      } catch (error) {
        console.error('Error in fetchExperimentDetails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (experimentId) {
      fetchExperimentDetails();
    }
  }, [experimentId]);

  const stats = useMemo(() => {
    if (!experiment?.participants) return { total: 0, variantA: 0, variantB: 0 };
    
    const total = experiment.participants.length;
    const variantA = experiment.participants.filter(p => p.variant === 'A').length;
    const variantB = experiment.participants.filter(p => p.variant === 'B').length;
    
    return { total, variantA, variantB };
  }, [experiment?.participants]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!experiment) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Experiment not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{experiment.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{experiment.description}</p>
            </div>
            <Badge variant={experiment.status === 'active' ? 'default' : 'secondary'}>
              {experiment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(experiment.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(experiment.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-sm text-muted-foreground">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Variants</p>
                <p className="text-sm text-muted-foreground">A/B</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{experiment.variant_a_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.variantA}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.variantA / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{experiment.variant_b_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.variantB}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.variantB / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {experiment.participants.map((participant, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">
                        {participant.profiles?.first_name} {participant.profiles?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {participant.profiles?.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant={participant.variant === 'A' ? 'default' : 'secondary'}>
                    Variant {participant.variant || 'A'}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
