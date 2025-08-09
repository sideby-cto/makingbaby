
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { journeyEmailIntegrationService } from '@/services/email/journeyEmailIntegrationService';
import { NotificationTemplateDialog } from './NotificationTemplateDialog';

interface TemplateListItemProps {
  template: any;
  stage: string;
  onRefresh: () => void;
}

export function TemplateListItem({ template, stage, onRefresh }: TemplateListItemProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await journeyEmailIntegrationService.deleteJourneyTemplate(template.id);
      toast({
        title: 'Template deleted',
        description: 'The notification template has been deleted successfully'
      });
      onRefresh();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error deleting template',
        description: error.message || 'Failed to delete template',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format reminder type for display
  const formatReminderType = (type: string) => {
    switch (type) {
      case 'initial': return 'Initial';
      case '24h': return '24h Reminder';
      case '48h': return '48h Reminder';
      case '1_week': return '1 Week Reminder';
      default: return type;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-md bg-card hover:bg-accent/5">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {template.active ? 'Active' : 'Inactive'}
            </span>
            <h4 className="text-sm font-medium">{formatReminderType(template.reminder_type)}</h4>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">
            Template: {template.email_template?.name || 'Unknown template'}
          </p>
          
          {template.template_variables && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Variables: {template.template_variables}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <NotificationTemplateDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        stage={stage}
        templateId={template.id}
        initialData={template}
        onSuccess={onRefresh}
        mode="edit"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this notification template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
