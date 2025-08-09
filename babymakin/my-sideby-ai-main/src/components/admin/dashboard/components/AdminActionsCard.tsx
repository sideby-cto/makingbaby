
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Users, ExternalLink } from "lucide-react";
import { UserTool } from "@/hooks/useUserTools";

interface AdminActionsCardProps {
  userTools: UserTool[];
  loading?: boolean;
}

export const AdminActionsCard = ({ userTools, loading = false }: AdminActionsCardProps) => {
  const sponsorshipCounts = userTools.reduce((acc, userTool) => {
    const toolName = userTool.name || 'Unknown';
    acc[toolName] = (acc[toolName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSponsorships = Object.values(sponsorshipCounts).reduce((sum: number, count: number) => sum + count, 0);

  if (loading) {
    return (
      <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-heading-lg text-semantic-text-primary font-sans flex items-center gap-3">
            <Package className="h-6 w-6 text-brand-primary" />
            Tool Sponsorships
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-heading-lg text-semantic-text-primary font-sans flex items-center gap-3">
          <Package className="h-6 w-6 text-brand-primary" />
          Tool Sponsorships
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {totalSponsorships === 0 ? (
          <div className="text-center py-8 text-semantic-text-secondary">
            <Package className="h-12 w-12 mx-auto mb-4 text-semantic-text-muted" />
            <p className="text-body-lg font-medium mb-2">No tool sponsorships yet</p>
            <p className="text-body-md">Sponsorships will appear here when users request them</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-semantic-text-secondary mb-6">
              <Users className="h-4 w-4" />
              <span className="text-body-md">
                {totalSponsorships} total sponsorship{totalSponsorships !== 1 ? 's' : ''} 
                across {Object.keys(sponsorshipCounts).length} tool{Object.keys(sponsorshipCounts).length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid gap-4">
              {Object.entries(sponsorshipCounts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([toolName, count]) => {
                  const firstUserTool = userTools.find(ut => ut.name === toolName);
                  const toolUrl = firstUserTool?.url;
                  
                  return (
                    <div
                      key={toolName}
                      className="flex items-center justify-between p-4 bg-semantic-background rounded-lg border border-semantic-border hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-accent/10 rounded-lg">
                          <Package className="h-4 w-4 text-brand-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-body-md font-medium text-semantic-text-primary">
                              {toolName}
                            </h4>
                            {toolUrl && (
                              <a
                                href={toolUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-primary hover:text-brand-primary/80 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-body-sm text-semantic-text-secondary">
                            {count} sponsorship request{count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-brand-accent/10 text-brand-accent border-brand-accent/20">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
