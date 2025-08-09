
import { Card } from "@/components/ui/card";
import type { Profile } from "@/types/profile";
import type { ProfileExperiment } from "@/types/experiments";
import { ProfileCardHeader } from "./ProfileCardHeader";
import { ExperimentDetails } from "./ExperimentDetails";
import { TestSMSForm } from "../TestSMSForm";
import { StudentSuccessSignsSummary } from "./StudentSuccessSignsSummary";
import { TranscriptAnalysisButton } from "./TranscriptAnalysisButton";
import { TranscriptBackfillTool } from "./TranscriptBackfillTool";
import { SessionDataSummary } from "./SessionDataSummary";
import { SessionCountDisplay } from "../common/SessionCountDisplay";
import { Phone } from "lucide-react";

interface ProfileExperimentCardProps {
  profile: Profile;
  experiment: ProfileExperiment | null;
  secondOpinion: ProfileExperiment | null;
  processingUserId: string | null;
  removingUserId: string | null;
  onRemoveUser: (userId: string, email: string) => void;
}

export const ProfileExperimentCard = ({
  profile,
  experiment,
  secondOpinion,
  processingUserId,
  removingUserId,
  onRemoveUser
}: ProfileExperimentCardProps) => {
  return (
    <Card 
      key={profile.id} 
      className="p-5 space-y-5 hover:shadow-md transition-shadow duration-300 border-slate-200 w-full max-w-full mx-auto overflow-hidden"
    >
      <ProfileCardHeader
        firstName={profile.first_name}
        lastName={profile.last_name}
        email={profile.email}
        userId={profile.id}
        onRemoveUser={() => onRemoveUser(profile.id, profile.email || '')}
        isRemoving={removingUserId === profile.id}
      />

      {experiment ? (
        <ExperimentDetails
          experimentId={experiment.experiment_type || 'default'}
        />
      ) : (
        <div className="space-y-3">
          <SessionCountDisplay
            userId={profile.id}
            userName={`${profile.first_name} ${profile.last_name}`.trim()}
            variant="detailed"
          />
          <SessionDataSummary
            userId={profile.id}
            userName={`${profile.first_name} ${profile.last_name}`.trim()}
          />
          <StudentSuccessSignsSummary
            studentId={profile.id}
            studentName={`${profile.first_name} ${profile.last_name}`.trim()}
          />
          <TranscriptAnalysisButton
            studentId={profile.id}
            studentName={`${profile.first_name} ${profile.last_name}`.trim()}
          />
          <TranscriptBackfillTool />
        </div>
      )}
      
      {profile.phone_verified && profile.phone_number && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Phone className="h-4 w-4 mr-1.5 text-primary-500" />
            Send Test SMS
          </h4>
          <TestSMSForm phoneNumber={profile.phone_number} />
        </div>
      )}
    </Card>
  );
};
