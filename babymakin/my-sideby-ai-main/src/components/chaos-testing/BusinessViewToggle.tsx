import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Code } from 'lucide-react';

interface BusinessViewToggleProps {
  isBusinessView: boolean;
  onToggle: (enabled: boolean) => void;
  hasTranslations: boolean;
}

export const BusinessViewToggle = ({ isBusinessView, onToggle, hasTranslations }: BusinessViewToggleProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isBusinessView ? (
              <Briefcase className="h-4 w-4 text-blue-600" />
            ) : (
              <Code className="h-4 w-4 text-gray-600" />
            )}
            <Label htmlFor="business-view" className="text-sm font-medium">
              {isBusinessView ? 'Business View' : 'Technical View'}
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Technical</span>
            <Switch
              id="business-view"
              checked={isBusinessView}
              onCheckedChange={onToggle}
              disabled={!hasTranslations}
            />
            <span className="text-xs text-muted-foreground">Business</span>
          </div>
        </div>
        
        {!hasTranslations && (
          <p className="text-xs text-muted-foreground mt-2">
            Business view will be available after running AI translation
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {isBusinessView 
            ? 'Showing business impact, user stories, and actionable recommendations'
            : 'Showing technical details, stack traces, and reproduction steps'
          }
        </p>
      </CardContent>
    </Card>
  );
};