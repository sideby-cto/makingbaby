import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MatchMessage } from "../types";
import { Bug, RefreshCw, Database, Wifi, WifiOff } from "lucide-react";

interface RealtimeDebugPanelProps {
  matchId: string;
  messages: MatchMessage[];
  partnerInfo: any;
  onRefreshMessages: () => void;
}

export const RealtimeDebugPanel = ({ 
  matchId, 
  messages, 
  partnerInfo, 
  onRefreshMessages 
}: RealtimeDebugPanelProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100));
  };

  useEffect(() => {
    addDebugLog(`Debug panel initialized for match: ${matchId}`);
    addDebugLog(`Current messages count: ${messages.length}`);
    addDebugLog(`Partner info: ${partnerInfo?.name || 'Unknown'}`);
  }, [matchId, messages.length, partnerInfo?.name]);

  const testConnection = async () => {
    setConnectionStatus('testing');
    addDebugLog('Testing real-time connection...');
    
    try {
      // Create a test channel to verify connectivity
      const testChannel = supabase
        .channel('debug-test')
        .subscribe((status, err) => {
          addDebugLog(`Test channel status: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
            addDebugLog('✅ Real-time connection successful');
            toast({
              title: "Connection Test",
              description: "Real-time connection is working!",
            });
            
            // Clean up test channel
            setTimeout(() => {
              supabase.removeChannel(testChannel);
              addDebugLog('Test channel cleaned up');
            }, 2000);
          } else if (status === 'CHANNEL_ERROR') {
            setConnectionStatus('disconnected');
            addDebugLog(`❌ Connection error: ${err?.message}`);
            toast({
              title: "Connection Test Failed",
              description: "Real-time connection is not working",
              variant: "destructive"
            });
          } else if (status === 'TIMED_OUT') {
            setConnectionStatus('disconnected');
            addDebugLog('❌ Connection timed out');
            toast({
              title: "Connection Test Timeout",
              description: "Real-time connection timed out",
              variant: "destructive"
            });
          }
        });
    } catch (error) {
      setConnectionStatus('disconnected');
      addDebugLog(`❌ Test connection error: ${error}`);
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage.trim()) return;
    
    addDebugLog(`Sending test message: "${testMessage}"`);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('match_scheduling_messages')
        .insert({
          match_id: matchId,
          sender_id: userData.user.id,
          content: `[DEBUG TEST] ${testMessage}`,
          sender_type: 'user'
        });

      if (error) {
        throw error;
      }

      addDebugLog('✅ Test message sent successfully');
      setTestMessage("");
      
      toast({
        title: "Test Message Sent",
        description: "Check if it appears in real-time",
      });
    } catch (error) {
      addDebugLog(`❌ Failed to send test message: ${error}`);
      toast({
        title: "Test Message Failed",
        description: "Could not send test message",
        variant: "destructive"
      });
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
    addDebugLog('Debug logs cleared');
  };

  const exportDebugInfo = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      matchId,
      messagesCount: messages.length,
      partnerInfo: partnerInfo?.name || 'Unknown',
      connectionStatus,
      logs: debugLogs,
      lastMessages: messages.slice(-5)
    };
    
    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realtime-debug-${matchId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addDebugLog('Debug info exported');
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Real-time Debug
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
          >
            ✕
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'connected' ? (
              <><Wifi className="h-3 w-3 mr-1" /> Connected</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> Disconnected</>
            )}
          </Badge>
          <Badge variant="outline">
            {messages.length} msgs
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        <Tabs defaultValue="logs" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mb-3">
            <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
            <TabsTrigger value="test" className="text-xs">Test</TabsTrigger>
            <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="h-48">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="outline" onClick={clearLogs}>
                Clear
              </Button>
              <Button size="sm" variant="outline" onClick={exportDebugInfo}>
                Export
              </Button>
            </div>
            <ScrollArea className="h-36 w-full border rounded p-2">
              <div className="text-xs font-mono space-y-1">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-xs">{log}</div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="test" className="h-48">
            <div className="space-y-3">
              <Button 
                size="sm" 
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="w-full"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Test Connection
              </Button>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Test message..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                />
                <Button size="sm" onClick={sendTestMessage} className="w-full">
                  Send Test Message
                </Button>
              </div>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRefreshMessages}
                className="w-full"
              >
                <Database className="h-3 w-3 mr-2" />
                Refresh Messages
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="info" className="h-48">
            <ScrollArea className="h-full">
              <div className="text-xs space-y-2">
                <div><strong>Match ID:</strong> {matchId}</div>
                <div><strong>Messages:</strong> {messages.length}</div>
                <div><strong>Partner:</strong> {partnerInfo?.name || 'Unknown'}</div>
                <div><strong>Last Message:</strong> {messages[messages.length - 1]?.created_at || 'None'}</div>
                <div><strong>Connection:</strong> {connectionStatus}</div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};