
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SessionSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SessionSearch = ({ value, onChange, className = "w-60" }: SessionSearchProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-secondary" />
      <Input
        placeholder="Search sessions..."
        className="pl-10 border-2 border-brand-primary/30 focus:border-brand-primary font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
