
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JourneyStageConfig {
  id: string;
  stage: string;
  label: string;
  color: string;
  display_order: number;
}

export const useJourneyStages = () => {
  const [stages, setStages] = useState<JourneyStageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setError(null);
        console.log('[useJourneyStages] Fetching stages from journey_stage_config');
        
        const { data, error: fetchError } = await supabase
          .from('journey_stage_config')
          .select('*')
          .is('deleted_at', null)
          .order('display_order', { ascending: true });

        if (fetchError) {
          console.error('[useJourneyStages] Error fetching stages:', fetchError);
          throw fetchError;
        }

        console.log('[useJourneyStages] Raw stages data from database:', data);

        // If no stages configured, use defaults with valid stage names
        if (!data || data.length === 0) {
          console.warn('[useJourneyStages] No stages found in database, using defaults');
          const defaultStages: JourneyStageConfig[] = [
            {
              id: 'new',
              stage: 'new',
              label: 'New',
              color: '#f97316',
              display_order: 1
            },
            {
              id: 'reflection_completed',
              stage: 'reflection_completed', 
              label: 'Reflection Completed',
              color: '#8b5cf6',
              display_order: 2
            },
            {
              id: 'matched',
              stage: 'matched',
              label: 'Matched',
              color: '#10b981',
              display_order: 3
            },
            {
              id: 'scheduled',
              stage: 'scheduled',
              label: 'Scheduled',
              color: '#3b82f6',
              display_order: 4
            },
            {
              id: 'conversation',
              stage: 'conversation',
              label: 'In Conversation',
              color: '#06b6d4',
              display_order: 5
            },
            {
              id: 'active',
              stage: 'active',
              label: 'Active',
              color: '#22c55e',
              display_order: 6
            },
            {
              id: 'inactive',
              stage: 'inactive',
              label: 'Inactive',
              color: '#6b7280',
              display_order: 7
            }
          ];
          setStages(defaultStages);
        } else {
          // Map database results to our interface, ensuring stage and id match
          const mappedStages = data.map(stage => ({
            id: stage.stage, // Use stage as the ID for drag-and-drop
            stage: stage.stage,
            label: stage.label || stage.stage,
            color: stage.color || '#6b7280',
            display_order: stage.display_order || 0
          }));
          
          console.log('[useJourneyStages] Mapped stages:', mappedStages);
          setStages(mappedStages);
        }
      } catch (err) {
        console.error('[useJourneyStages] Error in fetchStages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch stages'));
        
        // Don't fallback to default stages on error to ensure consistency
        // Let the error be handled by the UI
        setStages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  return { stages, loading, error };
};
