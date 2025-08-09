
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Notification } from "@/components/ui/notification";

interface DateDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | undefined;
  onDateChange: (date?: Date) => void;
  onConfirm: () => void;
  isSending: boolean;
  errorMessage: string | null;
}

export const CalendarInviteDialog = ({
  open,
  onClose,
  selectedDate,
  onDateChange,
  onConfirm,
  isSending,
  errorMessage
}: DateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Meeting Time</DialogTitle>
        </DialogHeader>
        
        {errorMessage && (
          <div className="mb-4">
            <Notification
              variant="error"
              title="Error"
              description={errorMessage}
              onClose={() => {}}
            />
          </div>
        )}
        
        <div className="py-4">
          <DatePicker 
            date={selectedDate} 
            onDateChange={onDateChange} 
          />
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!selectedDate || isSending}
          >
            {isSending ? "Sending..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
