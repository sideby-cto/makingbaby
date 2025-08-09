
import { useState } from "react";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface UserProfileDataProps {
  profile: Profile;
}

export const UserProfileData = ({ profile }: UserProfileDataProps) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download profile data as JSON
  const handleDownloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `profile-data-${profile.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          This is the data associated with your profile. You can download it as a JSON file.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDownloadData}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <Accordion
        type="multiple"
        value={expanded}
        onValueChange={setExpanded}
        className="border rounded-md"
      >
        <AccordionItem value="personal-info">
          <AccordionTrigger className="px-4">Personal Information</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-1">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">ID:</span>
                <span className="col-span-2 font-mono text-xs">{profile.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="col-span-2">{profile.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">First Name:</span>
                <span className="col-span-2">{profile.first_name || "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Last Name:</span>
                <span className="col-span-2">{profile.last_name || "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Bio:</span>
                <span className="col-span-2">{profile.bio || "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Teaching Experience:</span>
                <span className="col-span-2">{profile.teaching_experience || "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Created:</span>
                <span className="col-span-2">{formatDate(profile.created_at)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="col-span-2">{formatDate(profile.updated_at)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="subjects">
          <AccordionTrigger className="px-4">Subjects</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-1">
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <h4 className="text-sm font-medium mb-2">Subjects:</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects && profile.subjects.length > 0 ? (
                    profile.subjects.map(subject => (
                      <Badge key={subject} variant="secondary">{subject}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No subjects specified</span>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {profile.pacing && (
          <AccordionItem value="pacing">
            <AccordionTrigger className="px-4">Pacing Preferences</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Community:</span>
                  <span className="col-span-2">{profile.pacing.community_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="col-span-2 capitalize">{profile.pacing.level.replace('_', ' ')}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
