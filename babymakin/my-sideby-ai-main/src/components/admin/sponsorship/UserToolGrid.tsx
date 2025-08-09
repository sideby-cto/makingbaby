import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addMonths } from "date-fns";
import { Gift, ExternalLink, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile } from "@/types/database";

export interface UserToolGridProps {
  profile: Profile;
}

export const UserToolGrid = ({ profile }: UserToolGridProps) => {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableTools } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const assignToolMutation = useMutation({
    mutationFn: async (toolId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const expiresAt = addMonths(new Date(), 3);

      const { error } = await supabase
        .from('user_tools')
        .insert({
          user_id: profile.id,
          tool_id: toolId,
          assigned_by: user.id,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Tool Assigned",
        description: "The tool has been successfully assigned to the user.",
      });
      setSelectedTool("");
    },
    onError: (error) => {
      console.error('Error assigning tool:', error);
      toast({
        title: "Error",
        description: "Failed to assign the tool. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAssignTool = () => {
    if (selectedTool) {
      assignToolMutation.mutate(selectedTool);
    }
  };

  // Ensure user_tools is always an array even if null
  const userTools = profile.user_tools || [];

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Gift className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {profile.first_name} {profile.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedTool}
            onValueChange={setSelectedTool}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a tool" />
            </SelectTrigger>
            <SelectContent>
              {availableTools?.map((tool) => (
                <SelectItem key={tool.id} value={tool.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{tool.name}</span>
                    {tool.price_per_month && (
                      <span className="text-sm text-muted-foreground">
                        ${tool.price_per_month}/mo
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssignTool}
            disabled={!selectedTool || assignToolMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Assign Tool
          </Button>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {userTools.map((userTool: any) => (
          <div
            key={userTool.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{userTool.tools?.name || 'Unknown Tool'}</p>
                  {userTool.tools?.price_per_month && (
                    <div className="flex items-center text-sm text-green-600">
                      <DollarSign className="h-4 w-4" />
                      {userTool.tools.price_per_month}/mo
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Expires: {userTool.expires_at ? format(new Date(userTool.expires_at), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
            {userTool.tools?.url && (
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <a href={userTool.tools.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        ))}

        {userTools.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">No tools assigned yet.</p>
        )}
      </div>
    </Card>
  );
};
