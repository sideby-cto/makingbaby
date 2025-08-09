
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAvatarBucket = () => {
  const { toast } = useToast();
  const [bucketReady, setBucketReady] = useState(false);

  useEffect(() => {
    const ensureAvatarBucketExists = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setBucketReady(false);
          return;
        }

        // Simply assume the bucket is ready for authenticated users
        // Let actual upload operations handle any bucket-related errors
        setBucketReady(true);
        
      } catch (error: any) {
        console.error("Error checking authentication:", error);
        // Default to allowing upload attempts
        setBucketReady(true);
      }
    };

    ensureAvatarBucketExists();
  }, [toast]);

  return { bucketReady };
};
