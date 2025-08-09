import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NotificationTemplateForm } from "./components/NotificationTemplateForm";

interface NotificationTemplateEditorProps {
  templateId: string | null;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted?: () => void;
}

export function NotificationTemplateEditor({
  templateId,
  onSaved,
  onCancel,
  onDeleted
}: NotificationTemplateEditorProps) {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      reminder_type: "",
      email_template_id: "",
      template_variables: "",
      active: true
    }
  });

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("journey_reminder_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setTemplate(data);
      form.reset({
        reminder_type: data.reminder_type || "",
        email_template_id: data.email_template_id || "",
        template_variables: data.template_variables || "",
        active: data.active
      });
    } catch (error) {
      console.error("Error loading template:", error);
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: any) => {
    if (!templateId || !template) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("journey_reminder_templates")
        .update({
          reminder_type: values.reminder_type,
          email_template_id: values.email_template_id,
          template_variables: values.template_variables,
          active: values.active,
          updated_at: new Date().toISOString()
        })
        .eq("id", templateId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Template saved successfully"
      });
      
      onSaved();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!templateId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("journey_reminder_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
      
      toast({
        title: "Template Deleted",
        description: "The notification template has been deleted"
      });
      
      setIsDeleteDialogOpen(false);
      
      if (onDeleted) {
        onDeleted();
      } else {
        onCancel();
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !template) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>
                Edit {template?.stage && template.stage.replace('_', ' ')} Template
                <span className="text-sm text-muted-foreground ml-2 font-normal">
                  ({template?.reminder_type})
                </span>
              </CardTitle>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <NotificationTemplateForm 
              form={form} 
              templateData={template}
              disabled={loading}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="ghost" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {loading ? "Deleting..." : "Delete Template"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
