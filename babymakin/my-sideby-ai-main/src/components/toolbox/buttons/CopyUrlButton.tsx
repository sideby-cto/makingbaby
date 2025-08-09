import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CopyUrlButtonProps {
  url: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "outline";
}

export const CopyUrlButton = ({ 
  url, 
  className, 
  size = "sm",
  variant = "outline"
}: CopyUrlButtonProps) => {
  const { toast } = useToast();

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL copied",
        description: "The tool URL has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleCopyUrl}
      variant={variant}
      size={size}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        className
      )}
    >
      <Copy className="h-4 w-4" />
      Copy URL
    </Button>
  );
};