
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddToolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPredefined: (toolName: string) => void;
  onAddCustom: (name: string, url: string) => void;
  availablePredefinedTools: Array<{ name: string; url: string; description: string }>;
}

export const AddToolDialog = ({
  isOpen,
  onClose,
  onAddPredefined,
  onAddCustom,
  availablePredefinedTools
}: AddToolDialogProps) => {
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateUrl = (urlString: string): boolean => {
    if (!urlString.match(/^https?:\/\//i)) {
      urlString = 'https://' + urlString;
    }
    
    try {
      new URL(urlString);
      setUrlError(null);
      return true;
    } catch (error) {
      setUrlError("Please enter a valid URL");
      return false;
    }
  };

  const handleAddCustom = async () => {
    if (!customName.trim() || !customUrl.trim()) return;

    let processedUrl = customUrl.trim();
    if (!processedUrl.match(/^https?:\/\//i)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    if (!validateUrl(processedUrl)) return;

    setLoading(true);
    try {
      await onAddCustom(customName, processedUrl);
      setCustomName("");
      setCustomUrl("");
      setUrlError(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAddPredefined = async (toolName: string) => {
    setLoading(true);
    try {
      await onAddPredefined(toolName);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Tool</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Popular Tools</TabsTrigger>
            <TabsTrigger value="custom">Custom Tool</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined" className="space-y-4">
            {availablePredefinedTools.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You've added all available predefined tools!
              </div>
            ) : (
              <div className="grid gap-3">
                {availablePredefinedTools.map((tool) => (
                  <Card key={tool.name} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{tool.name}</h4>
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <ExternalLink className="h-3 w-3" />
                            {tool.url}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddPredefined(tool.name)}
                          disabled={loading}
                          size="sm"
                          className="ml-4"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tool-name">Tool Name</Label>
                <Input
                  id="tool-name"
                  placeholder="ChatGPT, Claude, etc."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tool-url">Tool URL</Label>
                <Input
                  id="tool-url"
                  placeholder="https://chat.openai.com"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    if (e.target.value) validateUrl(e.target.value);
                  }}
                  className={urlError ? "border-red-500" : ""}
                />
                {urlError && <p className="text-sm text-red-500">{urlError}</p>}
              </div>
              
              <Button 
                onClick={handleAddCustom}
                disabled={loading || !customName.trim() || !customUrl.trim() || !!urlError}
                className="w-full"
              >
                {loading ? "Adding..." : "Add Custom Tool"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
