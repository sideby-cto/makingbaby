
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MemberSelector } from "./MemberSelector";
import { checkAdminStatus } from "@/utils/admin/adminAuth";

interface AdminAddIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: () => void;
}

export const AdminAddIdeaDialog = ({ open, onOpenChange, userId, onSuccess }: AdminAddIdeaDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>(userId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const { toast } = useToast();

  // Check admin status when dialog opens
  useEffect(() => {
    if (open) {
      verifyAdminAccess();
    }
  }, [open]);

  const verifyAdminAccess = async () => {
    setAdminCheckLoading(true);
    
    try {
      const adminStatus = await checkAdminStatus();
      console.log("Admin verification result:", adminStatus);
      
      setIsAdmin(adminStatus.isAdmin);
      
      if (!adminStatus.isAdmin) {
        toast({
          title: "Access Denied",
          description: "This feature is only available to admin users",
          variant: "destructive"
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Admin verification failed:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive"
      });
      onOpenChange(false);
    } finally {
      setAdminCheckLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMemberId) {
      toast({
        title: "Error",
        description: "Please select a member",
        variant: "destructive"
      });
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Admin access required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Creating idea for member:", selectedMemberId);
      
      // Format the content to include the title if provided
      let finalContent = content.trim();
      if (title.trim()) {
        finalContent = `${title.trim()}: ${finalContent}`;
      }
      
      // Insert into saved_items table without the name and status fields
      const { error } = await supabase
        .from("saved_items")
        .insert({
          user_id: selectedMemberId,
          content: finalContent,
          type: 'idea'
        });

      if (error) {
        console.error("Error creating saved item:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Idea added successfully for the selected member"
      });

      // Reset form
      setTitle("");
      setContent("");
      setSelectedMemberId(userId);
      onOpenChange(false);
      onSuccess?.();

    } catch (error: any) {
      console.error("Error adding idea:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (adminCheckLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-gray-500">Verifying admin access...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isAdmin) {
    return null; // Dialog will close automatically
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Idea (Admin)</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member">Select Member *</Label>
            <MemberSelector
              selectedMemberId={selectedMemberId}
              onMemberSelect={setSelectedMemberId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter idea title..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter idea content..."
              rows={6}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Idea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
