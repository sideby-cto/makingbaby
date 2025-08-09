
// This is a redirect component to maintain compatibility
// Import from new location
import { PhoneNumberSection as NewPhoneNumberSection } from "./phone/PhoneNumberSection";
import { Profile } from "@/types/profile";

interface PhoneNumberSectionProps {
  profile: Profile;
}

export const PhoneNumberSection = (props: PhoneNumberSectionProps) => {
  // Simply pass through to the new component
  return <NewPhoneNumberSection {...props} />;
};
