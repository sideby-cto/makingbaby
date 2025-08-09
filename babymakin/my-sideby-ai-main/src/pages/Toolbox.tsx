
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { SimpleToolboxHeader } from "@/components/toolbox/sections/SimpleToolboxHeader";
import { ToolboxSearch } from "@/components/toolbox/sections/ToolboxSearch";
import { ToolboxColumnLayout } from "@/components/toolbox/sections/ToolboxColumnLayout";
import { useMyTools } from "@/hooks/useMyTools";

const Toolbox = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { tools, addCustomTool, removeTool } = useMyTools();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
        setLoading(false);
      } catch (error) {
        console.error("Failed to check user:", error);
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Comprehensive cleanup for animation remnants
  useEffect(() => {
    // Clean up any animation remnants when entering toolbox
    document.body.style.backdropFilter = '';
    document.body.style.filter = '';
    document.body.style.overflow = '';
    document.documentElement.style.scrollBehavior = '';
    
    // Remove any animation overlays that might be stuck
    const portalOverlays = document.querySelectorAll('[data-portal-overlay]');
    portalOverlays.forEach(overlay => overlay.remove());
    
    console.log('Toolbox: Animation cleanup completed');
  }, []);

  return (
    <DashboardLayout loading={loading}>
      <div className="space-y-8">
        <SimpleToolboxHeader userId={userId} />
        
        <ToolboxSearch 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
        />
        
        <ToolboxColumnLayout
          userId={userId}
          searchQuery={searchQuery}
          tools={tools}
          onAddTool={async (name, url, description, type) => {
            await addCustomTool(name, url, description, type);
          }}
          onRemoveTool={removeTool}
        />
      </div>
    </DashboardLayout>
  );
};

export default Toolbox;
