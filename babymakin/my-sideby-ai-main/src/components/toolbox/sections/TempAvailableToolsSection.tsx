
import React, { useState } from 'react';
import { ToolCard } from '../ToolCard';
import { Sparkles, VideoIcon, Cpu, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useToolbox } from '@/hooks/useToolbox';
import { useCommunityFavoriteBadge } from '@/hooks/useCommunityFavoriteBadge';

interface TempAvailableToolsSectionProps {
  userId: string | null;
  searchQuery?: string;
  onError?: (message: string) => void;
}

export const TempAvailableToolsSection = ({ 
  userId, 
  searchQuery = '',
  onError
}: TempAvailableToolsSectionProps) => {
  const { toast } = useToast();
  const { getAvailableTools, loading } = useToolbox(userId);
  const { isCommunityFavorite } = useCommunityFavoriteBadge();

  // Get available tools from the database
  const availableTools = getAvailableTools();

  // Filter tools based on search query
  const filteredTools = availableTools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToolClick = (tool: any) => {
    window.open(tool.url, '_blank');
  };

  // Map tool types to appropriate icons with better designs
  const getToolIcon = (type: string) => {
    switch (type) {
      case 'chatgpt_plus':
        return <Cpu className="h-7 w-7" />;
      case 'descript':
        return <VideoIcon className="h-7 w-7" />;
      case 'lovable_dev':
        return <Sparkles className="h-7 w-7" />;
      default:
        return <ExternalLink className="h-7 w-7" />;
    }
  };

  const getToolIconBackground = (type: string) => {
    switch (type) {
      case 'chatgpt_plus':
        return "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800 dark:to-emerald-700";
      case 'descript':
        return "bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-800 dark:to-indigo-700";
      case 'lovable_dev':
        return "bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-800 dark:to-rose-700";
      default:
        return "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600";
    }
  };

  const getToolIconColor = (type: string) => {
    switch (type) {
      case 'chatgpt_plus':
        return "text-green-600 dark:text-green-300";
      case 'descript':
        return "text-purple-600 dark:text-purple-300";
      case 'lovable_dev':
        return "text-pink-600 dark:text-pink-300";
      default:
        return "text-gray-600 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Available Tools
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Available Tools
        </h2>
        {searchQuery && (
          <p className="text-gray-600 dark:text-gray-400">
            {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>
      
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {filteredTools.map((tool) => (
            <ToolCard 
              key={tool.id}
              name={tool.name}
              description={tool.description || ''}
              icon={getToolIcon(tool.type)}
              iconBackground={getToolIconBackground(tool.type)}
              iconColor={getToolIconColor(tool.type)}
              buttonLabel="Access Tool"
              buttonVariant="primary"
              onClick={() => handleToolClick(tool)}
              tool={tool}
              badgeLabel={isCommunityFavorite(tool.type) ? "Community Favorite" : undefined}
              badgeVariant={isCommunityFavorite(tool.type) ? "custom" : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? "No tools match your search. Try a different keyword." : "No available tools found."}
          </p>
        </div>
      )}
    </div>
  );
};
