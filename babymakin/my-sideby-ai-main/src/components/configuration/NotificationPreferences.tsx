
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { Profile } from "@/types/profile";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NotificationPreferencesProps {
  profile: Profile;
}

export const NotificationPreferences = ({ profile }: NotificationPreferencesProps) => {
  const { toast } = useToast();
  const { preferences, updating, updatePreferences } = useNotificationPreferences(profile);
  const [phoneVerified, setPhoneVerified] = useState(profile?.phone_verified || false);
  const [hasPhone, setHasPhone] = useState(!!profile?.phone_number);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  
  // Sync local state with profile
  useEffect(() => {
    setPhoneVerified(profile?.phone_verified || false);
    setHasPhone(!!profile?.phone_number);
  }, [profile]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log("Profile updated event received in NotificationPreferences");
      setPhoneVerified(profile?.phone_verified || false);
      setHasPhone(!!profile?.phone_number);
    };
    
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [profile]);

  const handlePreferenceChange = async (channel: 'email' | 'sms' | 'in_app', value: boolean) => {
    // Special handling for SMS
    if (channel === 'sms' && value) {
      if (!hasPhone) {
        toast({
          title: "Phone number required",
          description: "Please add a phone number to enable SMS notifications.",
          variant: "default"
        });
        setShowVerifyDialog(true);
        return;
      }
      
      if (!phoneVerified) {
        toast({
          title: "Phone verification required",
          description: "Please verify your phone number to enable SMS notifications.",
          variant: "default"
        });
        setShowVerifyDialog(true);
        return;
      }
    }
    
    // Handle the preference change
    const newPreferences = {
      ...preferences,
      [channel]: value
    };
    
    const result = await updatePreferences(newPreferences);
    
    if (result.success) {
      toast({
        title: "Preferences updated",
        description: `${channel.replace('_', ' ').toUpperCase()} notifications ${value ? 'enabled' : 'disabled'}.`,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-primary-500" />
              <Label htmlFor="in-app-notifications" className="cursor-pointer">In-app Notifications</Label>
            </div>
            <Switch
              id="in-app-notifications"
              checked={preferences.in_app}
              disabled={updating}
              onCheckedChange={(checked) => handlePreferenceChange('in_app', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary-500" />
              <Label htmlFor="email-notifications" className="cursor-pointer">Email Notifications</Label>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email}
              disabled={updating}
              onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary-500" />
                <Label htmlFor="sms-notifications" className="cursor-pointer">SMS Notifications</Label>
              </div>
              {!hasPhone && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Add a phone number to enable SMS notifications
                </p>
              )}
              {hasPhone && !phoneVerified && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Verify your phone number to enable SMS notifications
                </p>
              )}
            </div>
            <Switch
              id="sms-notifications"
              checked={preferences.sms}
              disabled={updating || !phoneVerified}
              onCheckedChange={(checked) => handlePreferenceChange('sms', checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phone Verification Required</DialogTitle>
            <DialogDescription>
              {!hasPhone 
                ? "You need to add a phone number before you can enable SMS notifications." 
                : "You need to verify your phone number before you can enable SMS notifications."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowVerifyDialog(false);
              // Scroll to phone section
              const phoneSection = document.getElementById('phone-section');
              if (phoneSection) {
                phoneSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
              Go to Phone Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
