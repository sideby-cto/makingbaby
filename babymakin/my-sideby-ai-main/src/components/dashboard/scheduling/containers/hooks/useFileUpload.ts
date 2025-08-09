
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseFileUploadProps {
  matchId: string;
  sendMessage: (message: string) => Promise<boolean>;
}

export const useFileUpload = ({ matchId, sendMessage }: UseFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${matchId}/${Date.now()}.${fileExt}`;
      const filePath = `match_media/${fileName}`;
      
      const { error } = await supabase.storage
        .from("user_uploads")
        .upload(filePath, file);
      
      if (error) throw error;
      
      const { data } = supabase.storage
        .from("user_uploads")
        .getPublicUrl(filePath);
      
      if (data) {
        await sendMessage(`[Shared file: ${file.name}](${data.publicUrl})`);
      }
      
      toast({
        title: "File uploaded",
        description: "Your file has been shared in the chat."
      });
    } catch (error) {
      console.error("File upload failed:", error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleUploadFile
  };
};
