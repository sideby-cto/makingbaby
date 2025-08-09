import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SponsorshipFormData {
  store: string;
  district: string;
  region: string;
  tool_name: string;
  scheduler_link: string;
}

export const useClaimSponsorship = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const claimSponsorship = async (data: SponsorshipFormData) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to claim a sponsorship.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('sponsorships')
        .insert([
          {
            user_id: user.id,
            ...data,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sponsorship Claimed",
        description: "Your sponsorship request has been submitted successfully!",
      });

    } catch (error) {
      console.error('Error claiming sponsorship:', error);
      toast({
        title: "Error",
        description: "Failed to claim sponsorship. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    claimSponsorship,
    isLoading,
  };
};