
import React from "react";
import { Loader2 } from "lucide-react";

export const ChatLoading = () => {
  return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};
