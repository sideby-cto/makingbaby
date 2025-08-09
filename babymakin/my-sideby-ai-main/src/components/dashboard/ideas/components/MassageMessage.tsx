import React from 'react';
import { Copy, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MassagePrompt } from '../hooks/useMassagePrompts';

interface MassageMessageProps {
  massage: MassagePrompt;
  onCopyResponse?: (content: string) => void;
}

export const MassageMessage: React.FC<MassageMessageProps> = ({ 
  massage, 
  onCopyResponse 
}) => {
  const { toast } = useToast();

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const formattedDate = new Date(massage.created_at).toLocaleString();

  return (
    <div className="space-y-4 mb-6">
      {/* User Prompt */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-sideby-blue-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-sideby-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-sideby-blue-50 rounded-lg p-3 border border-sideby-blue-100">
            <p className="text-sm text-sideby-text-primary whitespace-pre-wrap">
              {massage.user_prompt}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-sideby-text-muted">{formattedDate}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(massage.user_prompt)}
              className="h-6 px-2 text-xs text-sideby-text-muted hover:text-sideby-text-primary"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-sideby-orange-100 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-sideby-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg p-3 border border-sideby-orange-100 shadow-sm">
            <p className="text-sm text-sideby-text-primary whitespace-pre-wrap leading-relaxed">
              {massage.ai_response}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(massage.ai_response)}
              className="h-6 px-2 text-xs text-sideby-text-muted hover:text-sideby-text-primary"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            {onCopyResponse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyResponse(massage.ai_response)}
                className="h-6 px-2 text-xs text-sideby-text-muted hover:text-sideby-text-primary"
              >
                Replace Original
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};