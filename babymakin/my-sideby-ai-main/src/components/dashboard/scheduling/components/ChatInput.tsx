
import React, { ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThinkingButton } from "@/components/ui/thinking-button";
import { Send, PaperclipIcon, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onKeyPress: (e: KeyboardEvent) => void;
  isLoading: boolean;
  isUploading: boolean;
  onUpload?: (file: File) => void;
  onDropScheduler?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
  isUploading,
  onUpload,
  onDropScheduler,
  disabled = false
}) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ENHANCED DEBUG: More detailed logging for missing buttons
  console.log("ChatInput ENHANCED DEBUG:", {
    onUpload: !!onUpload,
    onDropScheduler: !!onDropScheduler,
    disabled,
    isLoading,
    isUploading,
    // Button visibility checks
    showSchedulerButton: !!onDropScheduler,
    showUploadButton: !!onUpload,
    // Button container visibility
    showButtonContainer: !!(onDropScheduler || onUpload),
    // CSS debugging
    textareaClassName: "resize-none min-h-[40px] pr-20",
    buttonContainerClassName: "absolute right-2 bottom-2 flex gap-1",
    // Props validation
    propsReceived: {
      value: typeof value,
      onChange: typeof onChange,
      onSend: typeof onSend,
      onKeyPress: typeof onKeyPress,
      isLoading: typeof isLoading,
      isUploading: typeof isUploading,
      onUpload: typeof onUpload,
      onDropScheduler: typeof onDropScheduler,
      disabled: typeof disabled
    }
  });

  // CSS Visibility Debug: Check if buttons are rendered but hidden
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const buttonContainer = document.querySelector('[data-testid="message-input"]')?.parentElement?.querySelector('.absolute.right-2.bottom-2');
      const schedulerButton = buttonContainer?.querySelector('[aria-label="Drop scheduler link"]');
      const uploadButton = buttonContainer?.querySelector('[aria-label="Attach file"]');
      
      console.log("ChatInput CSS DEBUG:", {
        buttonContainer: {
          exists: !!buttonContainer,
          computed: buttonContainer ? window.getComputedStyle(buttonContainer) : null,
          visibility: buttonContainer ? window.getComputedStyle(buttonContainer).visibility : null,
          display: buttonContainer ? window.getComputedStyle(buttonContainer).display : null,
          zIndex: buttonContainer ? window.getComputedStyle(buttonContainer).zIndex : null,
          opacity: buttonContainer ? window.getComputedStyle(buttonContainer).opacity : null,
        },
        schedulerButton: {
          exists: !!schedulerButton,
          visible: schedulerButton ? window.getComputedStyle(schedulerButton).display !== 'none' : false,
        },
        uploadButton: {
          exists: !!uploadButton,
          visible: uploadButton ? window.getComputedStyle(uploadButton).display !== 'none' : false,
        }
      });
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [onUpload, onDropScheduler]);

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    if (onUpload) {
      onUpload(file);
    }
    
    // Reset file input
    e.target.value = "";
  };

  return (
    <div className="p-2 md:p-3 border-t bg-background safe-area-bottom">
      <div className="flex items-end space-x-2">
        <div className="relative flex-1">
          <Textarea
            data-testid="message-input"
            value={value}
            onChange={onChange}
            onKeyDown={onKeyPress}
            placeholder="Start your learning journey... Ask a question or share what's on your mind!"
            className="resize-none min-h-[44px] md:min-h-[40px] pr-16 md:pr-20 text-base md:text-sm border-border focus-visible:border-primary/40 focus-visible:ring-primary/20 focus-visible:shadow-sm transition-all duration-200 rounded-2xl"
            disabled={isLoading || isUploading || disabled}
            rows={1}
          />
          {/* Enhanced button container with better debugging and error handling */}
          <div 
            className="absolute right-2 bottom-2 flex gap-1" 
            data-testid="chat-input-buttons"
            style={{ zIndex: 10 }} // Ensure buttons are above other elements
          >
            {/* Scheduler Button */}
            {onDropScheduler && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 md:h-9 md:w-9 hover:bg-muted transition-colors touch-manipulation"
                disabled={isLoading || isUploading || disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Scheduler button clicked");
                  try {
                    onDropScheduler();
                  } catch (error) {
                    console.error("Error calling onDropScheduler:", error);
                  }
                }}
                aria-label="Drop scheduler link"
                data-testid="scheduler-button"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            )}
            
            {/* Upload Button */}
            {onUpload && (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 md:h-9 md:w-9 hover:bg-muted transition-colors touch-manipulation"
                  disabled={isLoading || isUploading || disabled}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Upload button clicked");
                    try {
                      handleAttachClick();
                    } catch (error) {
                      console.error("Error calling handleAttachClick:", error);
                    }
                  }}
                  aria-label="Attach file"
                  data-testid="upload-button"
                >
                  <PaperclipIcon className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={isLoading || isUploading || disabled}
                  data-testid="file-input"
                />
              </>
            )}
            
            {/* Fallback indicator when no buttons are shown */}
            {!onDropScheduler && !onUpload && (
              <div 
                className="text-xs text-muted-foreground px-2 py-1"
                data-testid="no-buttons-indicator"
                title="No scheduler or upload handlers provided"
              >
                No tools
              </div>
            )}
          </div>
        </div>
        <ThinkingButton
          data-testid="send-button"
          onClick={onSend}
          disabled={value.trim() === "" || disabled}
          isThinking={isLoading || isUploading}
          className="h-11 w-11 md:h-10 md:w-10 bg-primary hover:bg-primary/90 text-primary-foreground touch-manipulation"
          size="icon"
          aria-label="Send message"
        />
      </div>
    </div>
  );
};
