import { ToolCard } from '../ToolCard';
import { Sparkles } from 'lucide-react';
import { useToolbox } from '@/hooks/useToolbox';

interface TempUserToolsSectionProps {
  userId: string | null;
  searchQuery?: string;
  onError?: (message: string) => void;
}

export const TempUserToolsSection = ({ 
  userId, 
  searchQuery = '', 
  onError 
}: TempUserToolsSectionProps) => {
  const { userTools, loading } = useToolbox(userId);

  // Filter tools based on search query
  const filteredTools = userTools.filter((userTool) => 
    userTool.tools?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    userTool.tools?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userId) return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Tools</h2>
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

  if (filteredTools.length === 0 && !searchQuery) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Your Tools
        </h2>
        {searchQuery && (
          <p className="text-gray-600 dark:text-gray-400">
            {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>
      
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {filteredTools.map((userTool) => (
            <ToolCard 
              key={userTool.id}
              tool={userTool.tools as any}
              userId={userId}
              isUserTool={true}
              userToolId={userTool.id}
              badgeLabel="Your Tool"
              badgeVariant="included"
              buttonLabel="Access Tool"
              buttonVariant="primary"
              iconBackground="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10"
              iconColor="text-brand-primary dark:text-brand-primary"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? "No tools match your search." : "No tools found."}
          </p>
        </div>
      )}
    </div>
  );
};
