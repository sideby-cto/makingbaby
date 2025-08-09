
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Crew, NewCrew } from "../types";
import { getCrewLeadInfo } from "@/utils/admin/crewUtils";
import { useFileUpload } from "@/hooks/useFileUpload";

export const useCrews = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { uploadFile } = useFileUpload({ bucket: 'crew-logos' });

  useEffect(() => {
    const fetchCrews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('crews')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        const crewsWithLeads = await Promise.all(
          (data || []).map(async (crew) => ({
            ...crew,
            metadata: crew.metadata ? (typeof crew.metadata === 'string' ? JSON.parse(crew.metadata) : crew.metadata) : {},
            lead: await getCrewLeadInfo(crew.id)
          }))
        );

        setCrews(crewsWithLeads);
      } catch (error) {
        console.error("Error fetching crews:", error);
        toast({
          title: "Error",
          description: "Failed to load crews",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCrews();
  }, [toast]);

  const handleCreateCrew = async (newCrew: NewCrew) => {
    try {
      let logoUrl = null;
      
      // Upload logo if provided
      if (newCrew.logo) {
        const fileName = `${newCrew.code}-${Date.now()}.${newCrew.logo.name.split('.').pop()}`;
        logoUrl = await uploadFile(newCrew.logo, fileName);
      }

      const { data, error } = await supabase
        .from('crews')
        .insert([
          {
            name: newCrew.name,
            code: newCrew.code,
            description: newCrew.description || null,
            logo_url: logoUrl,
            metadata: {}
          }
        ])
        .select();
      
      if (error) throw error;
      
      const inserted = (data || []).map((crew) => ({ 
        ...crew, 
        metadata: crew.metadata ? (typeof crew.metadata === 'string' ? JSON.parse(crew.metadata) : crew.metadata) : {},
        lead: null 
      }));
      setCrews([...inserted, ...crews]);
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Crew created successfully",
      });
    } catch (error: any) {
      console.error("Error creating crew:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create crew",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCrew = async (updatedCrew: Crew & { logo_file?: File }) => {
    if (!updatedCrew) return;
    
    try {
      let logoUrl = updatedCrew.logo_url;
      
      // Upload new logo if provided
      if (updatedCrew.logo_file) {
        const fileName = `${updatedCrew.code}-${Date.now()}.${updatedCrew.logo_file.name.split('.').pop()}`;
        const newLogoUrl = await uploadFile(updatedCrew.logo_file, fileName);
        if (newLogoUrl) {
          logoUrl = newLogoUrl;
        }
      }

      const { error } = await supabase
        .from('crews')
        .update({
          name: updatedCrew.name,
          code: updatedCrew.code,
          description: updatedCrew.description,
          logo_url: logoUrl,
          metadata: updatedCrew.metadata || {}
        })
        .eq('id', updatedCrew.id);
      
      if (error) throw error;
      
      const finalUpdatedCrew = { ...updatedCrew, logo_url: logoUrl };
      delete (finalUpdatedCrew as any).logo_file;
      
      setCrews(crews.map(crew => 
        crew.id === updatedCrew.id ? finalUpdatedCrew : crew
      ));
      
      setSelectedCrew(finalUpdatedCrew);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Crew updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating crew:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update crew",
        variant: "destructive",
      });
    }
  };

  const handleEditCrew = (crew: Crew) => {
    setSelectedCrew(crew);
    setIsEditDialogOpen(true);
  };

  const handleViewMembers = (crew: Crew) => {
    setSelectedCrew(crew);
  };

  const handleBackToCrews = () => {
    setSelectedCrew(null);
  };

  return {
    crews,
    loading,
    selectedCrew,
    setSelectedCrew,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleCreateCrew,
    handleUpdateCrew,
    handleEditCrew,
    handleViewMembers,
    handleBackToCrews
  };
};
