import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CompassDescriptor {
  stage: string;
  display_name: string;
  description: string;
  icon_name: string;
  color_scheme: string;
}

interface UseCompassDescriptorsReturn {
  descriptors: CompassDescriptor[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useCompassDescriptors = (): UseCompassDescriptorsReturn => {
  const [descriptors, setDescriptors] = useState<CompassDescriptor[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDescriptors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('journey_stage_config')
        .select('stage, display_name, description, icon_name, color_scheme')
        .in('stage', ['learn', 'talk', 'grow', 'match'])
        .order('stage');

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setDescriptors(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error fetching compass descriptors:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDescriptors();
  }, []);

  return {
    descriptors,
    isLoading,
    error,
    refetch: fetchDescriptors
  };
};