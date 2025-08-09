
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const EmailNotice = () => {
  return (
    <Alert className="bg-blue-100 dark:bg-blue-950/50 border-2 border-blue-300 dark:border-blue-800 shadow-sm">
      <Info className="h-6 w-6 text-blue-700 dark:text-blue-400" />
      <AlertTitle className="font-bold text-lg text-gray-900 dark:text-gray-100">Email Verification</AlertTitle>
      <AlertDescription className="text-gray-800 dark:text-gray-200 text-base">
        <p>
          We'll use the email address associated with your sideby account to set up your Upduo profile. 
          Make sure it's an email you check regularly.
        </p>
        <p className="mt-2">
          <strong className="text-gray-900 dark:text-gray-100 font-bold">Community code:</strong> Use <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-[#FF5733] font-mono font-bold">washington</code> during setup
        </p>
      </AlertDescription>
    </Alert>
  );
};
