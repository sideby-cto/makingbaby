
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CrewLeadIndicator } from "@/components/admin/crews/CrewLeadIndicator";

interface EmailSectionProps {
  email: string | null;
  isCrewLead?: boolean;
}

export const EmailSection = ({ email, isCrewLead = false }: EmailSectionProps) => {
  const { toast } = useToast();

  const handleCopyEmail = async () => {
    if (email) {
      await navigator.clipboard.writeText(email);
      toast({
        title: "Email copied",
        description: "The email address has been copied to your clipboard.",
      });
    }
  };

  if (!email) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex items-center gap-1 flex-1">
        <p className="text-sm text-gray-500">{email}</p>
        {isCrewLead && <CrewLeadIndicator size="sm" />}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={handleCopyEmail}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};
