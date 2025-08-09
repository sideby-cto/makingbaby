
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  "data-testid"?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  "data-testid": testId 
}) => {
  const baseTestId = testId || `stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <Card 
      data-testid={baseTestId}
      className="transition-all duration-200 hover:shadow-md"
    >
      <CardHeader 
        className="flex flex-row items-center justify-between space-y-0 pb-2"
        data-testid={`${baseTestId}-header`}
      >
        <CardTitle 
          className="text-sm font-medium" 
          data-testid={`${baseTestId}-title`}
        >
          {title}
        </CardTitle>
        <Icon 
          className="h-4 w-4 text-muted-foreground" 
          data-testid={`${baseTestId}-icon`} 
        />
      </CardHeader>
      <CardContent data-testid={`${baseTestId}-content`}>
        <div 
          className="text-2xl font-bold" 
          data-testid={`${baseTestId}-value`}
        >
          {value.toLocaleString()}
        </div>
        <p 
          className="text-xs text-muted-foreground" 
          data-testid={`${baseTestId}-description`}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
