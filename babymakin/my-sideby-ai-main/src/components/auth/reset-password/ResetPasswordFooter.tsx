
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface ResetPasswordFooterProps {
  onHelp: () => void;
}

export function ResetPasswordFooter({ onHelp }: ResetPasswordFooterProps) {
  return (
    <CardFooter className="flex justify-center">
      <Button 
        variant="link" 
        className="text-gray-500 text-sm flex items-center gap-1"
        onClick={onHelp}
      >
        <HelpCircle className="h-4 w-4" />
        Having trouble resetting your password?
      </Button>
    </CardFooter>
  );
}
