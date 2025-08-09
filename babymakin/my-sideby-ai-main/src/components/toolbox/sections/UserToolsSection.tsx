
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ToolCard } from '../ToolCard';
import { UserTool } from '@/types/tools';

interface UserToolsSectionProps {
  userId: string | null;
  searchQuery?: string;
}

export const UserToolsSection = ({ userId, searchQuery = '' }: UserToolsSectionProps) => {
  // Use any type to bypass the excessive type instantiation error
  const { data: userTools = [], isLoading } = useQuery<any[]>({
    queryKey: ['userTools', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_tools')
        .select(`
          *,
          tools (*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!userId,
  });

  // Filter tools based on search query
  const filteredTools = userTools.filter((userTool: any) => 
    userTool.tools?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    userTool.tools?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(2)].map((_, i) => (
            <div 
              key={i} 
              className="bg-gray-100 dark:bg-gray-800 animate-pulse h-64 rounded-lg"
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Your Tools {searchQuery && `(${filteredTools.length} results)`}
      </h2>
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((userTool: any) => (
            <ToolCard 
              key={userTool.id}
              tool={userTool.tools}
              userId={userId}
              isUserTool={true}
              userToolId={userTool.id}
              badgeLabel="Your Tool"
              badgeVariant="included"
              buttonLabel="Access Tool"
              buttonVariant="primary"
            />
          ))}
        </div>
      ) : (
        searchQuery ? (
          <p className="text-gray-800 dark:text-gray-200">
            No tools matching your search.
          </p>
        ) : null
      )}
    </div>
  );
};
