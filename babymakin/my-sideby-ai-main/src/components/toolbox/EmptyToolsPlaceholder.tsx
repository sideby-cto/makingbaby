
import { Wrench } from "lucide-react";

interface EmptyToolsPlaceholderProps {
  message?: string;
}

export const EmptyToolsPlaceholder = ({ 
  message = "No tools available" 
}: EmptyToolsPlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
        <Wrench className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {message}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Tools will appear here once they are available or added to your collection.
      </p>
    </div>
  );
};
