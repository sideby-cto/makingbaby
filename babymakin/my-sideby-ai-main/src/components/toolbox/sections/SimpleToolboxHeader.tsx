import React from "react";
import { Briefcase, Award } from "lucide-react";
import { useBadgeOptIns } from "@/hooks/useBadgeOptIns";
import { BACK_TO_SCHOOL_BADGE_ID } from "@/utils/badgeLaunchConfig";

interface SimpleToolboxHeaderProps {
  userId: string | null;
}

export const SimpleToolboxHeader: React.FC<SimpleToolboxHeaderProps> = ({ userId }) => {
  const { isOptedIn, isLoading } = useBadgeOptIns(userId);
  
  // Check if user is enrolled in Back to School badge
  const isEnrolledInBackToSchool = isOptedIn(BACK_TO_SCHOOL_BADGE_ID);
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-sm">
          <Briefcase className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Your sideby Toolbox
        </h1>
      </div>
      
      <div className="space-y-6 max-w-4xl mx-auto">
        <p className="text-lg text-muted-foreground leading-relaxed">
          Organize your AI tools into three categories to streamline your workflow and boost productivity.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-2">Services</h3>
            <p className="text-muted-foreground mb-3">AI tools you use regularly for daily tasks</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• ChatGPT, Claude, Gemini</div>
              <div>• Descript, MagicSchool AI</div>
              <div>• Midjourney, DALL-E</div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-2">Assistants</h3>
            <p className="text-muted-foreground mb-3">Custom AI assistants trained for specific tasks</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Custom GPTs</div>
              <div>• Claude Projects</div>
              <div>• Specialized chatbots</div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-2">Schedulers</h3>
            <p className="text-muted-foreground mb-3">Tools that make collaboration and scheduling easier</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Calendly, Acuity</div>
              <div>• When2meet, Doodle</div>
              <div>• Google Calendar links</div>
            </div>
          </div>
        </div>
        
        {!isLoading && (
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-lg p-4 mt-8">
            <p className="text-sm text-foreground/90 font-medium">
              {isEnrolledInBackToSchool ? (
                <>
                  💡 <strong>Pro Tip:</strong> You're enrolled to earn the Back to School Badge. Can't wait to start!
                </>
              ) : (
                <>
                  <Award className="inline w-4 h-4 mr-1" /> <strong>Pro Tip:</strong> Enroll in the "Back to School Badge" to curate your essentials, 
                  resulting in a comprehensive and organized toolbox from day one.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};