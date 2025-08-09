
import React, { useState } from "react";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpduoIframeDialog } from "@/components/upduo/UpduoIframeDialog";
import { ToolIcon } from "./icons/ToolIcon";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface UpduoSetupProps {
  onUpduoClick: () => void;
}

export const UpduoSetup = ({
  onUpduoClick
}: UpduoSetupProps) => {
  const [upduoDialogOpen, setUpduoDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  const openUpduoInIframe = () => {
    setIsLoading(true);
    setUpduoDialogOpen(true);
    // Reset loading after a short delay to simulate loading state
    setTimeout(() => setIsLoading(false), 800);
  };
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <ToolIcon 
          icon={MessageSquare} 
          background="bg-gray-800" 
          color="text-gray-300"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm sm:text-base md:text-lg">Upduo for Educators</h4>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
            Use community code: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">washington</span>
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
        <Button 
          onClick={openUpduoInIframe} 
          className="bg-gray-900 hover:bg-gray-800 text-white flex-1 sm:flex-none"
          size={isMobile ? "sm" : "default"}
        >
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Open Upduo
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.open("/upduo", "_self")}
          className="border-gray-300 dark:border-gray-700 flex-1 sm:flex-none"
          size={isMobile ? "sm" : "default"}
        >
          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Learn More
        </Button>
      </div>
      
      <UpduoIframeDialog 
        isOpen={upduoDialogOpen} 
        onClose={() => setUpduoDialogOpen(false)} 
        isLoading={isLoading}
        communityCode="washington"
        mode="fullscreen"
      />
    </div>
  );
};
