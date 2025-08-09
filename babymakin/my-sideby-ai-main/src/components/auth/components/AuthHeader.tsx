import React, { useState } from "react";
import { JoinExistingCrewModal } from "./JoinExistingCrewModal";
import { useUserCrew } from "@/hooks/useUserCrew";
import { useSignupCrew } from "@/hooks/useSignupCrew";
import { useAuth } from "@/hooks/useAuth";

interface AuthHeaderProps {
  activeTab: "signin" | "signup";
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  activeTab
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { crew: userCrew } = useUserCrew();
  const { crew: signupCrew } = useSignupCrew();
  
  // Use signup crew for unauthenticated users, user crew for authenticated
  const crew = user ? userCrew : signupCrew;
  return <div className="bg-gradient-to-b from-classroom-cream-light to-classroom-cream py-8 px-4 border-b border-classroom-chalk">
      <div className="flex justify-center mb-6">
        <img src="/lovable-uploads/0da40708-6587-46e8-883e-15310c301556.png" alt="sideby logo" className="h-16 w-auto min-w-[100px] drop-shadow-sm" />
      </div>
      <div className="space-y-3 text-center">
        <h2 className="text-3xl font-bold text-palette-book-brown font-headline">
          {activeTab === "signin" ? "Welcome Back" : (
            <>
              Join sideby {" "}
              {crew ? (
                <span className="text-primary font-bold">{crew.name}</span>
              ) : (
                <>
                    {activeTab === "signup" ? (
                      <button
                        onClick={() => setModalOpen(true)}
                        className="text-primary hover:text-primary/80 transition-all cursor-pointer hover:scale-105 transform font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded px-1"
                        aria-label="Join an existing crew instead"
                      >
                        {"{for ai}*"}
                      </button>
                    ) : (
                      <span className="text-primary font-bold">{"{for ai}"}</span>
                    )}
                </>
              )}
            </>
          )}
        </h2>
        <p className="text-palette-book-brown/80 font-body text-lg leading-relaxed max-w-md mx-auto">Start building purposeful habits through guided, peer-powered learning.</p>
      </div>
      
      <JoinExistingCrewModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </div>;
};
