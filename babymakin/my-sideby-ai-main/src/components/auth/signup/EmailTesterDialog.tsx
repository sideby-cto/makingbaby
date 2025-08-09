import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TestEmailButton } from "@/components/upduo/TestEmailButton";

export const EmailTesterDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Empty but we keep the structure for compatibility */}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Test Email Service</DialogTitle>
          <DialogDescription>
            Use this tool to test if the email service is working correctly
          </DialogDescription>
        </DialogHeader>
        <TestEmailButton />
      </DialogContent>
    </Dialog>
  );
};
