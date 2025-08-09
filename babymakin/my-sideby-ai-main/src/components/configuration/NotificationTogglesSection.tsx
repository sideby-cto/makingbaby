
import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Profile, NotificationPreferences } from "@/types/profile";
import { Badge } from "@/components/ui/badge";

interface NotificationTogglesSectionProps {
  profile: Profile;
  preferences: NotificationPreferences;
  updatePreference: (key: keyof NotificationPreferences) => void;
  isLoading?: boolean;
}

export function NotificationTogglesSection({
  profile,
  preferences,
  updatePreference,
  isLoading = false
}: NotificationTogglesSectionProps) {
  // Track local loading states for each toggle separately
  const [loadingToggles, setLoadingToggles] = useState<Record<string, boolean>>({
    in_app: false,
    email: false,
    sms: false
  });

  // Update local loading state when global loading changes
  useEffect(() => {
    if (!isLoading) {
      setLoadingToggles({
        in_app: false,
        email: false,
        sms: false
      });
    }
  }, [isLoading]);

  // Handle toggle with local loading state
  const handleToggle = (key: keyof NotificationPreferences) => {
    setLoadingToggles(prev => ({ ...prev, [key]: true }));
    updatePreference(key);
  };

  return (
    <div className="space-y-4">
      {/* In-app notifications toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">In-App Notifications</div>
            <p className="text-sm text-gray-500">Receive notifications within the application</p>
          </div>
        </div>
        <Switch 
          checked={preferences.in_app} 
          onCheckedChange={() => handleToggle('in_app')}
          disabled={loadingToggles.in_app || isLoading}
        />
      </div>

      {/* Email notifications toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">Email Notifications</div>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
        </div>
        <Switch 
          checked={preferences.email} 
          onCheckedChange={() => handleToggle('email')}
          disabled={loadingToggles.email || isLoading}
        />
      </div>

      {/* SMS notifications toggle - now with "Coming Soon" badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-muted-foreground">SMS Notifications</span>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                Coming Soon
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              SMS notifications will be available soon
            </p>
          </div>
        </div>
        <Switch 
          checked={false} 
          disabled={true}
        />
      </div>
    </div>
  );
}
