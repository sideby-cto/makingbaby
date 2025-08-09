
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminNavbarProps {
  onMenuClick: () => void;
  onAddIdea: () => void;
}

export const AdminNavbar = ({ onMenuClick, onAddIdea }: AdminNavbarProps) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Back to main site */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-gray-600 hover:text-gray-900"
          >
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>

          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/0da40708-6587-46e8-883e-15310c301556.png" 
              alt="sideby logo" 
              className="h-8 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">Team Dashboard</h1>
              <p className="text-xs text-gray-500">Team Panel</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Add Idea */}
          <Button
            onClick={onAddIdea}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Idea</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
