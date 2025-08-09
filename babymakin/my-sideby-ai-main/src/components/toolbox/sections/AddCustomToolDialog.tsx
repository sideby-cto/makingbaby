import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, Bot, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddCustomToolDialogProps {
  onAddTool: (name: string, url: string, description?: string, type?: 'custom' | 'ai_assistant' | 'scheduler') => Promise<void>;
  toolType?: 'custom' | 'ai_assistant' | 'scheduler';
  trigger?: React.ReactNode;
}

export const AddCustomToolDialog = ({ onAddTool, toolType: defaultToolType = 'custom', trigger }: AddCustomToolDialogProps) => {
  const [open, setOpen] = useState(false);
  const [toolType, setToolType] = useState<'custom' | 'ai_assistant' | 'scheduler'>(defaultToolType);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !url) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddTool(name, url, description || undefined, toolType);
      
      // Reset form
      setName("");
      setUrl("");
      setDescription("");
      setOpen(false);
      
      toast({
        title: "Tool Added",
        description: `Your ${toolType === 'ai_assistant' ? 'AI assistant' : toolType === 'scheduler' ? 'scheduler' : 'custom tool'} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tool. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setDescription("");
    setToolType(defaultToolType);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Tool
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Custom Tool
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={toolType === 'custom' ? 'default' : 'outline'}
              onClick={() => setToolType('custom')}
              className="justify-start text-xs px-2"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Tool/Service
            </Button>
            <Button
              type="button"
              variant={toolType === 'ai_assistant' ? 'default' : 'outline'}
              onClick={() => setToolType('ai_assistant')}
              className="justify-start text-xs px-2"
            >
              <Bot className="h-3 w-3 mr-1" />
              AI Assistant
            </Button>
            <Button
              type="button"
              variant={toolType === 'scheduler' ? 'default' : 'outline'}
              onClick={() => setToolType('scheduler')}
              className="justify-start text-xs px-2"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Scheduler
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              {toolType === 'ai_assistant' ? 'Assistant Name' : toolType === 'scheduler' ? 'Scheduler Name' : 'Tool Name'} *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={toolType === 'ai_assistant' ? 'My Custom GPT' : toolType === 'scheduler' ? 'My Calendly' : 'Tool Name'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">
              {toolType === 'scheduler' ? 'Scheduler Link' : 'URL'} *
            </Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={toolType === 'scheduler' ? 'https://calendly.com/your-link' : 'https://...'}
              required
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe your ${toolType === 'ai_assistant' ? 'AI assistant' : toolType === 'scheduler' ? 'scheduler' : 'tool'} and how it helps you...`}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Adding..." : "Add Tool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};