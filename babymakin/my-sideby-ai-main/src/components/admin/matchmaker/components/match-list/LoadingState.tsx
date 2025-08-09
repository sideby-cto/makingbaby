
import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div className="py-10 text-center text-gray-500">
      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
      Loading matches...
    </div>
  );
};
