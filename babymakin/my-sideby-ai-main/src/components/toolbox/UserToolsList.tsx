import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CustomTool } from "@/types/tools";

interface UserToolsCardProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  onClick: () => void;
  additionalActions?: React.ReactNode;
  additionalContent?: React.ReactNode;
  buttonLabel?: string;
  buttonVariant?: string;
}

interface UserToolsListProps {
  userId: string | null;
  refreshTrigger?: number;
  cardComponent: React.ComponentType<any>;
  filterQuery?: string;
}

export const UserToolsList = ({ 
  userId, 
  refreshTrigger = 0, 
  cardComponent: CardComponent,
  filterQuery = "" 
}: UserToolsListProps) => {
  const [tools, setTools] = useState<CustomTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTools = async () => {
      if (!userId) {
        setTools([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_custom_tools')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTools((data || []) as CustomTool[]);
      } catch (error) {
        console.error('Error fetching tools:', error);
        toast({
          title: "Error",
          description: "Failed to load your tools",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [userId, refreshTrigger, toast]);

  const handleDeleteTool = async (id: string) => {
    if (!userId) return;
    
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('user_custom_tools')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setTools(tools.filter(tool => tool.id !== id));
      toast({
        title: "Tool removed",
        description: "The tool has been removed from your toolbox",
      });
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Error",
        description: "Failed to remove the tool",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter tools based on search query
  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    tool.url.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (tool.description && tool.description.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredTools.length === 0) {
    return (
      <div className="text-center py-10 md:py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        {filterQuery ? (
          <p className="text-gray-800 dark:text-gray-200">No tools match your search. Try a different query or add a new tool.</p>
        ) : (
          <p className="text-gray-800 dark:text-gray-200">You haven't added any tools yet. Click "Add Tool" to get started.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {filteredTools.map((tool) => (
        <CardComponent
          key={tool.id}
          name={tool.name}
          description={tool.description || `Quick access to ${tool.name}`}
          icon={<ExternalLink className="h-8 w-8" />}
          onClick={() => window.open(tool.url, '_blank')}
          additionalActions={
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 z-10 h-8 w-8 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 bg-white/80 hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove {tool.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the tool from your collection. You can always add it again later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteTool(tool.id)}
                    className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    {deletingId === tool.id ? "Removing..." : "Remove"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
          additionalContent={
            <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-2">
              {tool.url}
            </div>
          }
        />
      ))}
    </div>
  );
};
