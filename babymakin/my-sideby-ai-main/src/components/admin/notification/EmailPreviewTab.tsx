
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { generateEmailContent, formatNotificationType } from '@/utils/emailTemplates';
import { TEMPLATE_VERSION } from '@/utils/emailFormatters';

type PreviewType = 'single' | 'digest';
type NotificationType = 'match_message' | 'match_created' | 'new_idea';

export const EmailPreviewTab = () => {
  const [previewType, setPreviewType] = useState<PreviewType>('digest');
  const [notificationType, setNotificationType] = useState<NotificationType>('match_message');
  const [showMultiple, setShowMultiple] = useState(true);

  const demoDigestNotifications = {
    match_message: [
      { title: "New message from Alex", content: "Hey, would Thursday work for our chat?" },
      { title: "New message from Sarah", content: "Looking forward to our discussion about project-based learning!" }
    ],
    match_created: [
      { title: "New Learning Connection: Meet Taylor", content: "You've been matched with Taylor, an experienced math teacher." }
    ],
    new_idea: [
      { title: "New Learning Insight", content: "Check out this resource on student engagement strategies." },
      { title: "Content Recommendation", content: "New article: 'Innovation in Virtual Classrooms'" }
    ]
  };

  const renderEmailPreview = () => {
    const previewFrame = (
      <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-primary p-4 text-white text-sm flex items-center justify-between">
          <div>To: preview@sideby.ai</div>
          <div>From: notifications@sideby.ai</div>
        </div>
        <div className="p-6" style={{ minHeight: '400px' }}>
          <div dangerouslySetInnerHTML={{ 
            __html: generateEmailContent({
              type: previewType,
              notifications: showMultiple ? demoDigestNotifications : { [notificationType]: demoDigestNotifications[notificationType].slice(0, 1) }
            }) 
          }} />
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="space-y-2">
            <Label>Preview Type</Label>
            <RadioGroup 
              value={previewType} 
              onValueChange={(value) => setPreviewType(value as PreviewType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="digest" id="digest" />
                <Label htmlFor="digest">Digest</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Notification Type</Label>
            <RadioGroup 
              value={notificationType} 
              onValueChange={(value) => setNotificationType(value as NotificationType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="match_message" id="message" />
                <Label htmlFor="message">Messages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="match_created" id="match" />
                <Label htmlFor="match">Matches</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new_idea" id="idea" />
                <Label htmlFor="idea">Ideas</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Show Multiple</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={showMultiple}
                onCheckedChange={setShowMultiple}
              />
              <Label>Multiple notifications</Label>
            </div>
          </div>
          
          <div className="ml-auto flex items-center">
            <Badge variant="outline" className="text-xs">
              Template v{TEMPLATE_VERSION}
            </Badge>
          </div>
        </div>

        {previewFrame}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {renderEmailPreview()}
      </div>
    </Card>
  );
};
