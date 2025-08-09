
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddHatDialog } from "./AddHatDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useHatManagement } from "@/hooks/useHatManagement";
import type { ProfileSubjectStatus } from "@/types/profile";
import type { Json } from "@/integrations/supabase/types";
import { FlowHatBadge } from "./FlowHatBadge";
import { HatBadgesList } from "./HatBadgesList";
import { EmptyHatsState } from "./EmptyHatsState";
import { ReInferenceDialog } from "./ReInferenceDialog";
import { useLogger } from "@/hooks/useLogger";
import { GraduationCap, Sparkles, Plus } from "lucide-react";

interface HatMetadata {
  hat_name: string;
  source: string;
  session_id?: string;
}

interface ProfileHatsProps {
  userId: string;
  subjectStatuses: ProfileSubjectStatus[] | null;
  onUpdate: () => void;
}

export const ProfileHats = ({ userId, subjectStatuses, onUpdate }: ProfileHatsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { requestReInference, updateHatMetadata, isProcessing } = useHatManagement();
  const [suggestedHat, setSuggestedHat] = useState<string | undefined>();
  const [hatMetadataList, setHatMetadataList] = useState<HatMetadata[]>([]);
  const logger = useLogger('ProfileHats');

  useEffect(() => {
    const fetchHatMetadata = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("hat_metadata")
        .select("hat_name, source, session_id")
        .eq("user_id", userId);

      setHatMetadataList(!error && data ? data : []);
    };
    fetchHatMetadata();
  }, [userId, isDialogOpen, subjectStatuses]);

  // Get suggested hat from hat_detections instead of upduo_transcripts
  useEffect(() => {
    const fetchSuggestedHat = async () => {
      if (!isDialogOpen) return;
      try {
        // Prefer most recent, highest-confidence and pending/approved detection
        const { data, error } = await supabase
          .from('hat_detections')
          .select('hat_name, confidence')
          .eq('user_id', userId)
          .in('status', ['pending', 'approved'])
          .order('created_at', { ascending: false })
          .order('confidence', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (data?.hat_name && typeof data.hat_name === 'string') {
          setSuggestedHat(data.hat_name);
        } else {
          setSuggestedHat(undefined);
        }
      } catch (error) {
        logger.error('Error fetching suggested hat:', { error, userId });
        setSuggestedHat(undefined);
      }
    };
    fetchSuggestedHat();
  }, [isDialogOpen, userId, logger]);

  const handleSaveHat = async (hatName: string) => {
    try {
      const newSubjectStatus: ProfileSubjectStatus = {
        name: hatName,
        status: "active",
      };
      const updatedSubjectStatuses = [
        ...(subjectStatuses || []),
        newSubjectStatus
      ];
      const jsonSubjectStatuses: Json[] = updatedSubjectStatuses.map(status => ({
        name: status.name,
        status: status.status
      }) as Json);

      const { error } = await supabase
        .from("profiles")
        .update({ subject_statuses: jsonSubjectStatuses })
        .eq("id", userId);

      if (error) throw error;

      await updateHatMetadata(userId, hatName, 'manual');
      toast({
        title: "Hat added successfully!",
        description: `"${hatName}" hat has been added to your profile`,
      });
      onUpdate();
    } catch (error) {
      logger.error("Error saving hat:", { error, userId, hatName });
      toast({
        title: "Error",
        description: "Failed to save your hat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHatStatusChange = async (hatName: string, newStatus: ProfileSubjectStatus["status"]) => {
    try {
      const updatedSubjectStatuses = (subjectStatuses || []).map(status => 
        status.name === hatName 
          ? { ...status, status: newStatus }
          : status
      );

      const jsonSubjectStatuses: Json[] = updatedSubjectStatuses.map(status => ({
        name: status.name,
        status: status.status
      }) as Json);

      const { error } = await supabase
        .from("profiles")
        .update({ subject_statuses: jsonSubjectStatuses })
        .eq("id", userId);

      if (error) throw error;

      const statusText = newStatus === "old_hat" ? "old hat" : "active";
      toast({
        title: "Hat status updated",
        description: `"${hatName}" has been marked as ${statusText}`,
      });
      onUpdate();
    } catch (error) {
      logger.error("Error updating hat status:", { error, userId, hatName, newStatus });
      toast({
        title: "Error",
        description: "Failed to update hat status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const aiHat = (subjectStatuses || []).find(
    status => status.status === "ai-inferred" || status.status === "ai_inferred"
  );
  const aiHatName = aiHat?.name ?? suggestedHat;

  const formatHatName = (hatName: string) => hatName.toLowerCase();

  const [showReInferenceDialog, setShowReInferenceDialog] = useState(false);

  const handleReInferenceRequest = async () => {
    setShowReInferenceDialog(false);
    await requestReInference(userId, aiHatName ?? "");
    onUpdate();
  };

  // If user has hats
  const hasHats = (aiHatName != null) || (subjectStatuses && subjectStatuses.length > 0);

  return (
    <Card className="bg-gradient-to-br from-white via-sideby-orange-50/30 to-sideby-blue-50/30 border-2 border-sideby-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4 bg-gradient-to-r from-sideby-orange-50 to-sideby-blue-50 border-b border-sideby-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-sideby-orange-400 to-sideby-burgundy-500 rounded-lg shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-sideby-text-primary tracking-wide">My Hats</CardTitle>
              <p className="text-sm text-sideby-text-secondary font-medium">Your areas of expertise</p>
            </div>
          </div>
          {hasHats && (
            <div 
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-sideby-orange-50 border-2 border-sideby-orange-200 hover:border-sideby-orange-300 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm group"
            >
              <Plus className="h-4 w-4 text-sideby-orange-600 group-hover:text-sideby-orange-700" />
              <span className="text-sm font-bold text-sideby-orange-600 group-hover:text-sideby-orange-700">Add Hat</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {hasHats ? (
          <HatBadgesList
            aiHatName={aiHatName}
            subjectStatuses={subjectStatuses || []}
            hatMetadataList={hatMetadataList}
            isProcessing={isProcessing}
            onRequestReInference={handleReInferenceRequest}
            onAddHatClick={() => setIsDialogOpen(true)}
            onHatStatusChange={handleHatStatusChange}
            formatHatName={formatHatName}
            aiHatProps={{
              showFlowHat: !!aiHatName,
              onRequestFlowInference: () => setShowReInferenceDialog(true),
            }}
          />
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-sideby-orange-100 to-sideby-blue-100 rounded-full">
                <Sparkles className="h-8 w-8 text-sideby-orange-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-sideby-text-primary">No hats yet</h3>
              <p className="text-sideby-text-secondary font-medium">Add your first teaching hat to get started!</p>
            </div>
            <div 
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sideby-orange-500 to-sideby-burgundy-600 hover:from-sideby-orange-600 hover:to-sideby-burgundy-700 text-white font-bold rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Add Your First Hat
            </div>
          </div>
        )}
      </CardContent>

      <AddHatDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveHat}
        isAiInferred={!!suggestedHat}
        suggestedHat={suggestedHat}
      />

      <ReInferenceDialog
        open={showReInferenceDialog}
        onClose={() => setShowReInferenceDialog(false)}
        onConfirm={handleReInferenceRequest}
        isProcessing={isProcessing}
      />
    </Card>
  );
};
