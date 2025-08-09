
import React from "react";
import { AlertCircle, Eye, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface ImpersonationBannerProps {
  originalUser: { id: string; email: string } | null;
  impersonatedUserId: string | null;
  impersonatedUserEmail?: string;
}

export const ImpersonationBanner = ({
  originalUser,
  impersonatedUserId,
  impersonatedUserEmail,
}: ImpersonationBannerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  if (!originalUser || !impersonatedUserId) return null;

  console.log("Rendering ImpersonationBanner with:", { originalUser, impersonatedUserId, impersonatedUserEmail });

  const handleStopImpersonation = async () => {
    try {
      console.log(`Stopping impersonation for admin ${originalUser.id}`);
      
      // Reset impersonation status by setting impersonating_user_id to null
      const { error } = await supabase
        .from('profiles')
        .update({ impersonating_user_id: null })
        .eq('id', originalUser.id);
        
      if (error) {
        console.error("Error stopping impersonation:", error);
        toast({
          title: "Error",
          description: "Could not stop impersonation. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Invalidate profile query to ensure we get fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Impersonation Ended",
        description: "You've returned to your admin view.",
      });
      
      // Navigate to admin dashboard
      navigate("/admin");
    } catch (err) {
      console.error("Error in stop impersonation:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-amber-800 shadow-sm fixed top-[64px] left-0 right-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-medium flex items-center gap-1">
            <span>Admin mode:</span>
            <span className="font-bold">{originalUser.email}</span>
            <Eye className="h-4 w-4 mx-1" />
            <span>viewing as</span>
            <span className="font-bold">{impersonatedUserEmail || impersonatedUserId}</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-amber-600 flex items-center gap-1 hidden sm:flex">
            <AlertCircle className="h-4 w-4" />
            <span>Any actions will affect the impersonated user account</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStopImpersonation}
            className="bg-white text-amber-700 border-amber-300 hover:bg-amber-100 hover:text-amber-900"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Return to Admin View
          </Button>
        </div>
      </div>
    </div>
  );
};
