
import React, { useEffect } from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Lightbulb } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ConversationIcon } from "@/components/icons/ConversationIcon";
import { AtomIcon } from "@/components/icons/AtomIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { BrainIcon } from "@/components/icons/BrainIcon";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  hasAnyMatches?: boolean; // Controls which tabs are visible
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange,
  hasAnyMatches = false
}) => {
  const isMobile = useIsMobile();

  // Log active tab for debugging
  useEffect(() => {
    console.log("TabNavigation rendering with activeTab:", activeTab, "hasAnyMatches:", hasAnyMatches);
  }, [activeTab, hasAnyMatches]);

  const handleTabClick = (value: string) => {
    console.log("Tab clicked:", value);
    onTabChange(value);
  };

  // For matched users: show Partners, Ideas, and Learning (3 columns)
  // For unmatched users: show Tasks, Ideas, and Learning (3 columns)
  const gridCols = "grid-cols-3";

  return (
    <div className={cn(
      `grid w-full ${gridCols} gap-2 p-2`,
      isMobile && "gap-1 p-1"
    )}>
      {/* Show Tasks tab only for users without matches */}
      {!hasAnyMatches && (
        <button
          onClick={() => handleTabClick("tasks")}
          className={cn(
            "flex items-center justify-center rounded-full w-full",
            "bg-palette-highlighter-yellow hover:bg-classroom-accent",
            "transition-all duration-200 ease-in-out",
            "border-2 border-transparent",
            activeTab === "tasks" && "border-classroom-border",
            isMobile ? "h-10" : "h-12"
          )}
        >
          <PencilIcon className={cn("h-6 w-6", isMobile && "h-5 w-5")} />
        </button>
      )}
      
      {/* Show Partners tab only for users with matches */}
      {hasAnyMatches && (
        <button
          onClick={() => handleTabClick("partners")}
          className={cn(
            "flex items-center justify-center rounded-full w-full",
            "bg-palette-highlighter-yellow hover:bg-classroom-accent",
            "transition-all duration-200 ease-in-out",
            "border-2 border-transparent",
            activeTab === "partners" && "border-classroom-border",
            isMobile ? "h-10" : "h-12"
          )}
        >
          <ConversationIcon className={cn("h-6 w-6", isMobile && "h-5 w-5")} />
        </button>
      )}
      
      {/* Ideas tab is always visible */}
      <button
        onClick={() => handleTabClick("ideas")}
        className={cn(
          "flex items-center justify-center rounded-full w-full",
          "bg-palette-highlighter-yellow hover:bg-classroom-accent",
          "transition-all duration-200 ease-in-out",
          "border-2 border-transparent",
          activeTab === "ideas" && "border-classroom-border",
          isMobile ? "h-10" : "h-12"
        )}
      >
        <AtomIcon className={cn("h-6 w-6", isMobile && "h-5 w-5")} />
      </button>
      
      {/* Learning tab is always visible */}
      <button
        onClick={() => handleTabClick("learning")}
        className={cn(
          "flex items-center justify-center rounded-full w-full",
          "bg-palette-highlighter-yellow hover:bg-classroom-accent",
          "transition-all duration-200 ease-in-out",
          "border-2 border-transparent",
          activeTab === "learning" && "border-classroom-border",
          isMobile ? "h-10" : "h-12"
        )}
      >
        <BrainIcon className={cn("h-6 w-6", isMobile && "h-5 w-5")} />
      </button>
    </div>
  );
};
