
import { AlertCircle, Construction } from "lucide-react";

interface DevelopmentOverlayProps {
  children: React.ReactNode;
  message?: string;
}

export const DevelopmentOverlay = ({ 
  children, 
  message = "In Development" 
}: DevelopmentOverlayProps) => {
  return (
    <div className="relative">
      {/* The blurred content */}
      <div className="filter blur-[4px] pointer-events-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
        <div className="bg-white px-6 py-4 rounded-lg shadow-lg text-center max-w-xs">
          <Construction className="mx-auto h-12 w-12 text-amber-500 mb-2" />
          <h3 className="font-bold text-lg mb-1">{message}</h3>
          <p className="text-gray-600 text-sm">
            This feature is currently under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
};
