import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, Settings } from 'lucide-react';
import { UpduoUserAssociationPanel } from '../user-association/UpduoUserAssociationPanel';
import { SessionAssociationMonitor } from '../user-association/SessionAssociationMonitor';
import { UpduoSessionsDialog } from './components/UpduoSessionsDialog';

export const AdminUpduoPanel = () => {
  const [activeTab, setActiveTab] = useState('associations');
  const [showSessionsBrowser, setShowSessionsBrowser] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Upduo Management Panel
          </CardTitle>
          <CardDescription>
            Manage Upduo user associations and monitor session tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="associations" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Associations
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Session Monitoring
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Session Browser
              </TabsTrigger>
            </TabsList>

            <TabsContent value="associations" className="mt-6">
              <UpduoUserAssociationPanel />
            </TabsContent>

            <TabsContent value="monitoring" className="mt-6">
              <SessionAssociationMonitor />
            </TabsContent>

            <TabsContent value="sessions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upduo Sessions Browser</CardTitle>
                  <CardDescription>
                    Browse and manage Upduo sessions in detail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UpduoSessionsDialog 
                    open={showSessionsBrowser} 
                    onOpenChange={setShowSessionsBrowser} 
                  />
                  {!showSessionsBrowser && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Click below to open the sessions browser
                      </p>
                      <button 
                        onClick={() => setShowSessionsBrowser(true)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Open Session Browser
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};