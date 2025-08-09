
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTranslation = () => {
  const [translatingPost, setTranslatingPost] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMicrotranslate = async (postId: string) => {
    try {
      setIsLoading(true);
      setTranslatingPost(postId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use the microtranslate feature.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('microtranslate', {
        body: { postId, readerId: user.id },
      });

      if (error) throw error;

      setTranslation(data.translated);
    } catch (error) {
      console.error('Microtranslation error:', error);
      toast({
        title: "Microtranslation failed",
        description: "Unable to microtranslate the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!translation || !translatingPost) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Since saved_items is removed, we'll just create a post
      const { error: postError } = await supabase.from("posts").insert({
        content: translation,
        type: "ai_trick",
        user_id: user.id,
      });

      if (postError) throw postError;

      toast({
        title: "Success",
        description: "Microtranslation shared successfully",
      });
      
      setTranslation(null);
      setTranslatingPost(null);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "Unable to save the microtranslation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    translatingPost,
    translation,
    isLoading,
    handleMicrotranslate,
    handleSaveTranslation,
    setTranslation,
    setTranslatingPost,
  };
};
