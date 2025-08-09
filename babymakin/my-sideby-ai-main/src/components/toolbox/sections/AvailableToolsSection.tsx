
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tool } from '@/types/tools';
import { ToolCard } from '@/components/toolbox/ToolCard';
import { useToolbox } from '@/contexts/ToolboxContext';
import { Separator } from '@/components/ui/separator';
import { EmptyToolsPlaceholder } from '@/components/toolbox/EmptyToolsPlaceholder';

interface AvailableToolsSectionProps {
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
}

export const AvailableToolsSection: React.FC<AvailableToolsSectionProps> = ({ 
  tools, 
  onSelectTool 
}) => {
  const { favorites, addFavorite, removeFavorite } = useToolbox();
  
  const categories = [...new Set(tools.map(tool => tool.category || 'Uncategorized'))];
  
  if (!tools.length) {
    return <EmptyToolsPlaceholder message="No tools available" />;
  }
  
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Tools</TabsTrigger>
        {categories.map(category => (
          <TabsTrigger key={category} value={category}>
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onClick={() => onSelectTool(tool)}
              buttonLabel="Access Tool"
              additionalActions={
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (favorites.some(fav => fav.id === tool.id)) {
                      removeFavorite(tool.id);
                    } else {
                      addFavorite(tool);
                    }
                  }}
                >
                  {favorites.some(fav => fav.id === tool.id) ? '★' : '☆'}
                </Button>
              }
            />
          ))}
        </div>
      </TabsContent>
      
      {categories.map(category => (
        <TabsContent key={category} value={category} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools
              .filter(tool => (tool.category || 'Uncategorized') === category)
              .map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onClick={() => onSelectTool(tool)}
                  buttonLabel="Access Tool"
                  additionalActions={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (favorites.some(fav => fav.id === tool.id)) {
                          removeFavorite(tool.id);
                        } else {
                          addFavorite(tool);
                        }
                      }}
                    >
                      {favorites.some(fav => fav.id === tool.id) ? '★' : '☆'}
                    </Button>
                  }
                />
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AvailableToolsSection;
