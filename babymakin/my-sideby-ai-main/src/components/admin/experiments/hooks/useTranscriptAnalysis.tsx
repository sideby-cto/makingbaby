
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Get Supabase URL from environment or fallback to a default
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "https://mzoolkwmpppncywkqezd.supabase.co";

export function useTranscriptAnalysis(refetchExperiments: () => Promise<any>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string
  ) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".vtt")) {
      setSelectedFile(file);
      handleAnalyzeTranscript(file, userId);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a .vtt file",
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeTranscript = async (
    file: File,
    userId: string,
    isSecondOpinion = false
  ) => {
    try {
      setProcessingUserId(userId);
      const fileText = await file.text();

      // Get current admin user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/analyze-transcript`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              (
                await supabase.auth.getSession()
              ).data.session?.access_token
            }`,
          },
          body: JSON.stringify({
            transcript: fileText,
            userId: userId,
            isSecondOpinion,
            adminId: user.id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to analyze transcript");

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      await refetchExperiments();

      toast({
        title: isSecondOpinion
          ? "Second opinion complete"
          : "Analysis complete",
        description: isSecondOpinion
          ? "Alternative role suggestions have been generated."
          : "The transcript has been analyzed and profile suggestions have been generated.",
      });
    } catch (error) {
      console.error("Error analyzing transcript:", error);
      toast({
        title: "Error",
        description: "Failed to analyze transcript. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingUserId(null);
      setSelectedFile(null);
    }
  };

  return {
    selectedFile,
    processingUserId,
    handleFileChange,
    handleAnalyzeTranscript,
  };
}
