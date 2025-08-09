
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Match } from "../types/matches";
import { useToast } from "@/hooks/use-toast";
import { sendMatchEmail } from "../services/emailService";
import { InfoIcon, MailIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface EmailSectionProps {
  match: Match;
  onEmailSent: () => void;
}

export const EmailSection: React.FC<EmailSectionProps> = ({ match, onEmailSent }) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const result = await sendMatchEmail(match);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Email sent",
        description: "Notification email sent to participants"
      });
      
      onEmailSent();
    } catch (err) {
      console.error("Error sending email:", err);
      toast({
        title: "Error",
        description: "Failed to send email: " + (err instanceof Error ? err.message : String(err)),
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (match.email_sent_at) {
    return (
      <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-md">
        <div className="flex items-center gap-2">
          <MailIcon className="h-4 w-4 text-green-500" />
          <span>Email sent on {new Date(match.email_sent_at).toLocaleDateString()}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleSendEmail} disabled={isSending}>
                <InfoIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resend match email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
      <div className="text-sm text-blue-700">
        Match email has not been sent yet
      </div>
      <Button onClick={handleSendEmail} disabled={isSending} size="sm">
        {isSending ? "Sending..." : "Send Match Email"}
      </Button>
    </div>
  );
};
