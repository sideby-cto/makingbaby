import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpduoConversationButton } from "@/components/dashboard/scheduling/components/UpduoConversationButton";
import { UpduoIframeDialog } from "@/components/upduo/UpduoIframeDialog";
import { Settings, Users, Monitor, MessageSquare } from "lucide-react";

export const EmbeddedUpduoDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'conversation' | 'reflection' | 'planning'>('conversation');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">sideby Embedded Session Demo</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the new embedded mode for sideby sessions with contextual guidance and improved user experience.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">New Feature</Badge>
            <Badge variant="outline">Embedded Mode</Badge>
          </div>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Demo Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                variant={activeDemo === 'conversation' ? 'default' : 'outline'}
                onClick={() => setActiveDemo('conversation')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Partner Conversation
              </Button>
              <Button
                variant={activeDemo === 'reflection' ? 'default' : 'outline'}
                onClick={() => setActiveDemo('reflection')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Personal Reflection
              </Button>
              <Button
                variant={activeDemo === 'planning' ? 'default' : 'outline'}
                onClick={() => setActiveDemo('planning')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Session Planning
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="reflection" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Reflection
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Planning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Partner Conversation Demo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Shows how the embedded mode works for real-time conversations between learning partners.
                </p>
              </CardHeader>
              <CardContent>
                <UpduoConversationButton
                  partnerName="Sarah Johnson"
                  mode="embedded"
                  communityCode="washington"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reflection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Reflection Demo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Demonstrates the embedded interface for individual reflection sessions.
                </p>
              </CardHeader>
              <CardContent>
                <UpduoIframeDialog
                  mode="embedded"
                  sessionType="reflection"
                  communityCode="washington"
                  isLoading={false}
                  isOpen={true}
                  onClose={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Planning Demo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Shows how partners can collaboratively plan their learning sessions.
                </p>
              </CardHeader>
              <CardContent>
                <UpduoIframeDialog
                  mode="embedded"
                  sessionType="planning"
                  partnerName="Alex Rivera"
                  communityCode="washington"
                  isLoading={false}
                  isOpen={true}
                  onClose={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contextual Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Session-specific tips and information are displayed alongside the iframe to help users succeed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Responsive Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The interface adapts seamlessly between desktop and mobile devices with optimized layouts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integrated Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sessions are embedded within the dashboard, maintaining navigation and context.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};