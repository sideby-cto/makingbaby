
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { addMonths } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SponsorshipRequest {
  id: string;
  user_id: string;
  tool_name: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Tool {
  id: string;
  name: string;
  type: string;
  description: string | null;
  url: string;
  price_per_month: number | null;
}

interface AssignToolDialogProps {
  request: SponsorshipRequest;
  onClose: () => void;
}

export const AssignToolDialog = ({
  request,
  onClose
}: AssignToolDialogProps) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [months, setMonths] = useState<number>(3); // Default to 3 months
  const { toast } = useToast();
  
  useEffect(() => {
    fetchTools();
    
    // Find tool that matches the requested name (fuzzy match)
    if (request?.tool_name) {
      const lowercaseRequest = request.tool_name.toLowerCase();
      const match = tools.find(tool => 
        tool.name.toLowerCase().includes(lowercaseRequest) || 
        lowercaseRequest.includes(tool.name.toLowerCase())
      );
      if (match) {
        setSelectedTool(match.id);
      }
    }
  }, [request?.tool_name, tools.length]);
  
  const fetchTools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssign = async () => {
    if (!selectedTool) {
      toast({
        title: "Tool Required",
        description: "Please select a tool to assign",
        variant: "destructive",
      });
      return;
    }
    
    setAssigning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const expiresAt = addMonths(new Date(), months);
      
      // Assign the tool to the user
      const { error: assignError } = await supabase
        .from('user_tools')
        .insert({
          user_id: request.user_id,
          tool_id: selectedTool,
          assigned_by: user.id,
          expires_at: expiresAt.toISOString(),
        });
        
      if (assignError) throw assignError;
      
      toast({
        title: "Tool Assigned",
        description: "The requested tool has been successfully assigned to the user",
      });
      
      onClose();
    } catch (error) {
      console.error('Error assigning tool:', error);
      toast({
        title: "Error",
        description: "Failed to assign the tool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Tool to User</DialogTitle>
          <DialogDescription>
            Assign a tool to {request.profile?.first_name} {request.profile?.last_name} based on their request for {request.tool_name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tool">Select Tool</Label>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading available tools...
                </span>
              </div>
            ) : (
              <Select
                value={selectedTool}
                onValueChange={setSelectedTool}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent>
                  {tools.map((tool) => (
                    <SelectItem key={tool.id} value={tool.id}>
                      <div className="flex justify-between w-full">
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
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (months)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={24}
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value) || 3)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={assigning || loading || !selectedTool}
          >
            {assigning && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Assign Tool
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
