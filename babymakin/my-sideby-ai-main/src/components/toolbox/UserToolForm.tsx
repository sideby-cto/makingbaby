
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubmitHandler } from "@/hooks/useSubmitHandler";

interface UserToolFormProps {
  userId: string | null;
  onToolAdded: () => void;
}

export const UserToolForm = ({ userId, onToolAdded }: UserToolFormProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const { isSubmitting, error, hasRetried, submitWithHandler, retry, reset } = useSubmitHandler();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      throw new Error("Please log in to add a tool");
    }

    if (!name.trim()) {
      throw new Error("Please provide a name for the tool");
    }

    let processedUrl = url.trim();
    if (!processedUrl) {
      throw new Error("Please provide a URL for the tool");
    }

    if (!processedUrl.match(/^https?:\/\//i)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    if (!validateUrl(processedUrl)) {
      throw new Error("Please provide a valid URL");
    }

    const submitFunction = async () => {
      const { error } = await supabase
        .from('user_custom_tools')
        .insert({
          user_id: userId,
          name: name.trim(),
          url: processedUrl,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    };

    await submitWithHandler(submitFunction, {
      successMessage: `${name} has been added to your toolbox`,
      errorMessage: "Failed to add tool. Please try again.",
      onSuccess: () => {
        setName("");
        setUrl("");
        setUrlError(null);
        onToolAdded();
      }
    });
  };

  const handleRetry = () => {
    if (!userId || !name.trim() || !url.trim()) return;

    let processedUrl = url.trim();
    if (!processedUrl.match(/^https?:\/\//i)) {
      processedUrl = 'https://' + processedUrl;
    }

    const submitFunction = async () => {
      const { error } = await supabase
        .from('user_custom_tools')
        .insert({
          user_id: userId,
          name: name.trim(),
          url: processedUrl,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    };

    retry(submitFunction, {
      successMessage: `${name} has been added to your toolbox`,
      errorMessage: "Failed to add tool. Please try again.",
      onSuccess: () => {
        setName("");
        setUrl("");
        setUrlError(null);
        onToolAdded();
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center gap-2 text-red-800 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          {!hasRetried && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="mt-2 text-red-700 border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tool-name" className="text-base font-medium">Tool Name</Label>
          <Input
            id="tool-name"
            placeholder="ChatGPT, Claude, etc."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-10"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tool-url" className="text-base font-medium">Tool URL</Label>
          <Input
            id="tool-url"
            placeholder="https://chat.openai.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (e.target.value) validateUrl(e.target.value);
            }}
            required
            className={`h-10 ${urlError ? "border-red-500" : ""}`}
            disabled={isSubmitting}
          />
          {urlError && <p className="text-sm text-red-500">{urlError}</p>}
          <p className="text-xs text-gray-500 mt-1">
            All valid URLs are accepted, including modern domains like .dev, .app, etc.
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white h-11" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Adding...</span>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
