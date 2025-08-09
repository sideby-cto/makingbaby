
import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserToolForm } from "./UserToolForm";
import { Button } from "@/components/ui/button";

interface ToolsSidePanelProps {
  userId: string | null;
  onToolAdded: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ToolsSidePanel = ({ 
  userId, 
  onToolAdded, 
  isOpen, 
  onClose 
}: ToolsSidePanelProps) => {
  return (
    <>
      {/* Overlay when side panel is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full md:w-80 lg:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Add Your Own Tools</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Close tools panel">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <UserToolForm userId={userId} onToolAdded={() => {
              onToolAdded();
              // Optional: we could auto-close panel on mobile after adding
              // if (window.innerWidth < 768) onClose();
            }} />
          </div>
        </div>
      </div>
    </>
  );
};
