import React from "react";
import { ToolCard } from "@/components/toolbox/ToolCard";
import { AddCustomToolDialog } from "./AddCustomToolDialog";
import { Button } from "@/components/ui/button";
import { CopyUrlButton } from "@/components/toolbox/buttons/CopyUrlButton";
import { Wrench, Bot, Calendar, Plus } from "lucide-react";
import { CustomTool } from "@/types/tools";

interface ToolboxColumnProps {
  title: string;
  icon: React.ReactNode;
  tools: CustomTool[];
  onRemoveTool: (id: string) => void;
  onAddTool: (name: string, url: string, description?: string, type?: 'custom' | 'ai_assistant' | 'scheduler') => Promise<void>;
  toolType: 'custom' | 'ai_assistant' | 'scheduler';
  searchQuery: string;
}

const ToolboxColumn = ({ 
  title, 
  icon, 
  tools, 
  onRemoveTool, 
  onAddTool, 
  toolType, 
  searchQuery 
}: ToolboxColumnProps) => {
  const filteredTools = tools.filter(tool => 
    !searchQuery || 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-card rounded-xl border border-classroom-border p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-sm">
            {filteredTools.length}
          </span>
        </div>
        <AddCustomToolDialog 
          onAddTool={(name, url, description, type) => onAddTool(name, url, description, type || toolType)}
          toolType={toolType}
          trigger={
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            {icon}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? `No ${title.toLowerCase()} found` : `No ${title.toLowerCase()} added yet`}
          </p>
          {!searchQuery && (
            <AddCustomToolDialog 
              onAddTool={(name, url, description, type) => onAddTool(name, url, description, type || toolType)}
              toolType={toolType}
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add {title.slice(0, -1)}
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTools.map((tool) => {
            // Show copy button for Assistants and Schedulers
            const showCopyButton = toolType === 'ai_assistant' || toolType === 'scheduler';
            
            return (
              <div key={tool.id} className="relative">
                <ToolCard
                  name={tool.name}
                  description={tool.description}
                  buttonLabel="Open"
                  buttonVariant="yellow"
                  onClick={() => window.open(tool.url, '_blank')}
                  showRemoveButton={true}
                  onRemove={() => onRemoveTool(tool.id)}
                  additionalActions={showCopyButton ? (
                    <CopyUrlButton 
                      url={tool.url} 
                      className="w-full"
                    />
                  ) : undefined}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ToolboxColumnLayoutProps {
  userId: string | null;
  searchQuery: string;
  tools: CustomTool[];
  onAddTool: (name: string, url: string, description?: string, type?: 'custom' | 'ai_assistant' | 'scheduler') => Promise<void>;
  onRemoveTool: (id: string) => void;
}

export const ToolboxColumnLayout = ({
  userId,
  searchQuery,
  tools,
  onAddTool,
  onRemoveTool
}: ToolboxColumnLayoutProps) => {
  if (!userId) return null;

  // Separate tools by type with mutually exclusive categorization
  const customTools = tools.filter(tool => 
    (tool.type === 'custom' && !(tool.metadata as any)?.tool_type) || 
    (tool.type === 'predefined' && (tool.metadata as any)?.tool_type !== 'ai_assistant' && (tool.metadata as any)?.tool_type !== 'scheduler')
  );
  
  const aiAssistants = tools.filter(tool => 
    (tool.metadata as any)?.tool_type === 'ai_assistant'
  );
  
  const schedulerTools = tools.filter(tool => 
    tool.type === 'scheduler' || (tool.metadata as any)?.tool_type === 'scheduler'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ToolboxColumn
        title="Services"
        icon={<Wrench className="h-5 w-5 text-primary" />}
        tools={customTools}
        onRemoveTool={onRemoveTool}
        onAddTool={onAddTool}
        toolType="custom"
        searchQuery={searchQuery}
      />
      
      <ToolboxColumn
        title="Assistants"
        icon={<Bot className="h-5 w-5 text-primary" />}
        tools={aiAssistants}
        onRemoveTool={onRemoveTool}
        onAddTool={onAddTool}
        toolType="ai_assistant"
        searchQuery={searchQuery}
      />
      
      <ToolboxColumn
        title="Schedulers"
        icon={<Calendar className="h-5 w-5 text-primary" />}
        tools={schedulerTools}
        onRemoveTool={onRemoveTool}
        onAddTool={onAddTool}
        toolType="scheduler"
        searchQuery={searchQuery}
      />
    </div>
  );
};