
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { migrateIdeas } from '@/utils/migrations/ideaMigration';
import type { MigrationResult } from '@/utils/migrations/types';
import { supabase } from '@/integrations/supabase/client';

export const IdeaMigrationTool = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();

  const handleMigration = async () => {
    try {
      setIsMigrating(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const result: MigrationResult = await migrateIdeas(user.id);

      toast({
        title: 'Migration Complete',
        description: `Successfully migrated ${result.migrated || 0} ideas.`,
      });
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: 'Migration Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Idea Migration Tool</h2>
      <Button 
        onClick={handleMigration} 
        disabled={isMigrating}
      >
        {isMigrating ? 'Migrating...' : 'Migrate Ideas'}
      </Button>
    </div>
  );
};
