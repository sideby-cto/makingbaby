import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Database, Settings, LogOut, User } from "lucide-react";
import HeadIcon from "@/components/icons/Sideby_GraphicElements_Icon_Head.svg";
import QuestionIcon from "@/components/icons/Sideby_GraphicElements_Icon_Question.svg";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserCrew } from "@/hooks/useUserCrew";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { DayCounter } from "@/components/DayCounter";
import React, { useState } from "react";
import { HelpDialog } from "@/components/help";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useAdminStatus();
  const { crew } = useUserCrew();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [helpOpen, setHelpOpen] = useState(false);

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      console.log("Sign out response:", { error });
      
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: `Failed to log out: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Logout successful, navigating to home");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (err) {
      console.error("Unexpected logout error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleBackToToolbox = () => {
    navigate("/toolbox");
  };

  const showBackToDashboardButton = 
    location.pathname === "/your-data" ||
    location.pathname === "/settings" ||
    location.pathname === "/profile";
  
  const showBackToToolboxButton = location.pathname.startsWith("/upduo") || location.pathname === "/sponsorship";
  const showBackButton = location.pathname === "/toolbox";

  return (
    <>
      <nav className="fixed top-0 w-full bg-classroom-cream shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 py-2 flex-shrink-0">
                <img 
                  src="/lovable-uploads/0da40708-6587-46e8-883e-15310c301556.png" 
                  alt="sideby logo" 
                  className="h-8 sm:h-10 w-auto min-w-[60px] sm:min-w-[76px]"
                />
                {crew?.logo_url && (
                  <div className="flex items-center space-x-2">
                    <div className="w-px h-6 bg-gray-300"></div>
                    <img 
                      src={crew.logo_url} 
                      alt={`${crew.name} logo`} 
                      className="h-6 sm:h-8 w-auto max-w-[60px] sm:max-w-[80px] object-contain"
                    />
                  </div>
                )}
              </Link>
              
              {(showBackButton || showBackToDashboardButton || showBackToToolboxButton) && (
                <Button 
                  variant="ghost" 
                  onClick={showBackToToolboxButton ? handleBackToToolbox : handleBackToDashboard}
                  className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg hover:bg-gray-100 px-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Back to {showBackToToolboxButton ? "Toolbox" : "Dashboard"}</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
              {isAdmin && (
                <Button variant="ghost" asChild className="font-medium hover:bg-gray-100 px-2 sm:px-3 text-sm sm:text-base">
                  <Link to="/admin">
                    <span className="hidden sm:inline">Team</span>
                    <span className="sm:hidden">Team</span>
                  </Link>
                </Button>
              )}
              
              <Button 
                variant="ghost"
                onClick={() => setHelpOpen(true)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 active:scale-95 active:bg-gray-200 transition-all duration-150 p-0 flex items-center justify-center shadow-sm"
                aria-label="Get help"
              >
                <img src={QuestionIcon} alt="Help" className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Help</span>
              </Button>
              
              {user && (
                <>
                  <NotificationCenter />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 active:scale-95 active:bg-gray-200 transition-all duration-150 p-0 flex items-center justify-center shadow-sm data-[state=open]:bg-gray-200 data-[state=open]:scale-95"
                        aria-label="User menu"
                      >
                        {profile?.avatar_url ? (
                          <UserAvatar 
                            avatar_url={profile.avatar_url}
                            first_name={profile.first_name}
                            last_name={profile.last_name}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          />
                        ) : profile ? (
                          <UserAvatar 
                            first_name={profile.first_name}
                            last_name={profile.last_name}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          />
                        ) : (
                          <img src={HeadIcon} alt="User menu" className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/toolbox" className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Your Toolbox
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              
              {!user && (
                <Button 
                  variant="default" 
                  onClick={() => navigate("/register")}
                  className="bg-[#FF5733] hover:bg-[#FF5733]/90 text-white font-medium px-2 sm:px-4 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Enter Here</span>
                  <span className="sm:hidden">Enter</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
};
