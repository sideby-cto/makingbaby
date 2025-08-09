
import { Profile } from "@/types/profile";
import { NotificationPreferences } from "@/components/configuration/NotificationPreferences";
import { PhoneNumberSection } from "@/components/configuration/phone/PhoneNumberSection";

interface NotificationPreferencesFormProps {
  profile: Profile;
}

export const NotificationPreferencesForm = ({ profile }: NotificationPreferencesFormProps) => {
  return (
    <div className="space-y-6">
      {/* Display notification preferences component */}
      <NotificationPreferences profile={profile} />
      
      {/* Show SMS verification section */}
      <PhoneNumberSection profile={profile} />
    </div>
  );
};
