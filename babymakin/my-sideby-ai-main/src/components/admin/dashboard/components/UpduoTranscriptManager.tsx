import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpduoSessions } from "@/hooks/useUpduoSessions";
import { UpduoTranscriptAnalysisDialog } from "./UpduoTranscriptAnalysisDialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, Database, Download, ExternalLink, Search } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const UpduoTranscriptManager = () => {
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isViewingRecent, setIsViewingRecent] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [storedTranscripts, setStoredTranscripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { 
    sessions, 
    isLoading: sessionsLoading, 
    storeSessionTranscript 
  } = useUpduoSessions(20, true);
  
  const { toast } = useToast();

  const loadStoredTranscripts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('upduo_transcripts')
        .select(`
          id,
          created_at,
          user_id,
          conversation_id,
          metadata,
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setStoredTranscripts(data || []);
    } catch (error) {
      console.error("Error loading stored transcripts:", error);
      toast({
        title: "Error",
        description: "Failed to load stored transcripts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  React.useEffect(() => {
    if (!isViewingRecent) {
      loadStoredTranscripts();
    }
  }, [isViewingRecent]);
  
  const handleStoreTranscript = async (sessionId: string) => {
    const success = await storeSessionTranscript(sessionId);
    if (success) {
      if (!isViewingRecent) {
        loadStoredTranscripts();
      }
    }
  };
  
  const handleViewTranscript = (transcriptId: string) => {
    setSelectedTranscriptId(transcriptId);
    setIsAnalysisDialogOpen(true);
  };
  
  const filteredData = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    if (isViewingRecent) {
      return sessions.filter(session => {
        if (session.id.toLowerCase().includes(query)) return true;
        const sessionTitle = session.knowledgeNodes?.[0]?.name?.toLowerCase() || '';
        if (sessionTitle.includes(query)) return true;
        const hasMatchingParticipant = session.users?.some(user => 
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query)
        );
        if (hasMatchingParticipant) return true;
        return false;
      });
    } else {
      return storedTranscripts.filter(transcript => {
        if (transcript.id.toLowerCase().includes(query)) return true;
        if (transcript.conversation_id.toLowerCase().includes(query)) return true;
        const sessionTitle = transcript.metadata?.session_title?.toLowerCase() || 
                            transcript.metadata?.knowledgeNodes?.[0]?.name?.toLowerCase() || '';
        if (sessionTitle.includes(query)) return true;
        const participantName = `${transcript.profiles?.first_name || ''} ${transcript.profiles?.last_name || ''}`.toLowerCase();
        if (participantName.includes(query)) return true;
        return false;
      });
    }
  }, [isViewingRecent, sessions, storedTranscripts, searchQuery]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-lg flex justify-between items-center">
          <span>Upduo Transcript Manager</span>
          <div>
            <Button
              variant={isViewingRecent ? "default" : "outline"}
              size="sm"
              className="mr-2"
              onClick={() => setIsViewingRecent(true)}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Recent Sessions
            </Button>
            <Button
              variant={!isViewingRecent ? "default" : "outline"}
              size="sm"
              onClick={() => setIsViewingRecent(false)}
            >
              <Database className="h-4 w-4 mr-1" />
              Stored Transcripts
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isViewingRecent ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading sessions...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {session.knowledgeNodes && session.knowledgeNodes.length > 0
                          ? session.knowledgeNodes[0].name
                          : "Untitled Session"}
                      </TableCell>
                      <TableCell>
                        {session.users && session.users.map((user: any) => (
                          <span key={user.id} className="block text-sm">
                            {user.firstName} {user.lastName}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {session.type === "PAIR" ? "Pair" : session.type === "SINGLE" ? "Solo" : session.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mr-2"
                          onClick={() => handleStoreTranscript(session.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Store
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!session.transcriptContents}
                          onClick={() => {
                            window.open(`https://app.upduo.com/dashboard/sessions/${session.id}`, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Analyzed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading transcripts...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No stored transcripts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((transcript: any) => (
                    <TableRow key={transcript.id}>
                      <TableCell>
                        {format(new Date(transcript.created_at), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell>
                        {transcript.profiles
                          ? `${transcript.profiles.first_name || ''} ${transcript.profiles.last_name || ''}`
                          : "Unknown User"}
                      </TableCell>
                      <TableCell>
                        {transcript.metadata?.session_title || 
                         transcript.metadata?.knowledgeNodes?.[0]?.name ||
                         "Untitled Session"}
                      </TableCell>
                      <TableCell>
                        {transcript.metadata?.suggested_hats || transcript.metadata?.primary_flow_activity ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTranscript(transcript.id)}
                        >
                          <Brain className="h-4 w-4 mr-1" />
                          Analyze
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <UpduoTranscriptAnalysisDialog
        transcriptId={selectedTranscriptId || undefined}
        open={isAnalysisDialogOpen}
        onOpenChange={setIsAnalysisDialogOpen}
      />
    </Card>
  );
};
