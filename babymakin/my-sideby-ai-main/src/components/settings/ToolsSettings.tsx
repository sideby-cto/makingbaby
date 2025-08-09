
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpduoSetup } from "@/components/toolbox/UpduoSetup";
import { useNavigate } from "react-router-dom";
import { Plus, Wrench, ExternalLink, Trash2 } from "lucide-react";
import { useMyTools } from "@/hooks/useMyTools";
import { AddToolDialog } from "@/components/toolbox/AddToolDialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export const ToolsSettings = () => {
  const { tools, loading, addPredefinedTool, addCustomTool, removeTool, getAvailablePredefinedTools } = useMyTools();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddPredefined = async (toolName: string) => {
    await addPredefinedTool(toolName);
  };

  const handleAddCustom = async (name: string, url: string) => {
    await addCustomTool(name, url);
  };

  const handleRemoveTool = async (toolId: string) => {
    setDeletingId(toolId);
    try {
      await removeTool(toolId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My Tools</CardTitle>
              <CardDescription>
                Manage your favorite AI tools and custom resources
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 p-6 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-800 dark:text-gray-200 mb-4">No tools added yet</p>
              <p className="text-sm text-gray-500 mb-4">Add your favorite AI tools and custom resources to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tool
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <Card key={tool.id} className="relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 z-10 h-8 w-8 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 bg-white/80 hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
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
                          onClick={() => handleRemoveTool(tool.id)}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          {deletingId === tool.id ? "Removing..." : "Remove"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <CardContent className="p-4 space-y-3" onClick={() => window.open(tool.url, '_blank')}>
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                        <ExternalLink className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base truncate">{tool.name}</h3>
                          {tool.type === 'predefined' && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        {tool.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {tool.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {tool.url}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upduo for Educators</CardTitle>
          <CardDescription>Connect with other educators for meaningful conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <UpduoSetup onUpduoClick={() => {}} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request a Sponsorship</CardTitle>
          <CardDescription>Need help covering tool costs?</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/sponsorship')}>Request Sponsorship</Button>
        </CardContent>
      </Card>

      <AddToolDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddPredefined={handleAddPredefined}
        onAddCustom={handleAddCustom}
        availablePredefinedTools={getAvailablePredefinedTools()}
      />
    </div>
  );
};
