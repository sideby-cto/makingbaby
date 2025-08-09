
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Flag, 
  BookmarkPlus,
  Share2,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestNote {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  type: "note" | "issue" | "bookmark";
  userId?: string;
}

interface TeamCollaborationProps {
  selectedUserId: string | null;
  selectedUserEmail?: string;
}

export const TeamCollaboration = ({ selectedUserId, selectedUserEmail }: TeamCollaborationProps) => {
  const { toast } = useToast();
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<"note" | "issue" | "bookmark">("note");
  const [teamNotes, setTeamNotes] = useState<TestNote[]>([
    {
      id: "1",
      author: "Mike",
      content: "Dashboard loading is slow for this user, investigating performance issues.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      type: "issue",
      userId: selectedUserId || undefined
    },
    {
      id: "2", 
      author: "Sarah",
      content: "User has great engagement with the Ideas feature - good test case for new UI updates.",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      type: "bookmark",
      userId: selectedUserId || undefined
    }
  ]);

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user and enter a note",
        variant: "destructive"
      });
      return;
    }

    const note: TestNote = {
      id: Date.now().toString(),
      author: "You", // In real implementation, get from auth context
      content: newNote,
      timestamp: new Date(),
      type: noteType,
      userId: selectedUserId
    };

    setTeamNotes(prev => [note, ...prev]);
    setNewNote("");
    
    toast({
      title: "Note Added",
      description: `${noteType.charAt(0).toUpperCase() + noteType.slice(1)} saved for ${selectedUserEmail}`,
    });
  };

  const handleShareSession = () => {
    if (!selectedUserId) return;
    
    // In real implementation, generate shareable link
    const shareUrl = `${window.location.origin}/admin/view-as/${selectedUserId}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Session Shared",
      description: "Shareable link copied to clipboard",
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: TestNote["type"]) => {
    switch (type) {
      case "note": return MessageSquare;
      case "issue": return Flag;
      case "bookmark": return BookmarkPlus;
    }
  };

  const getTypeColor = (type: TestNote["type"]) => {
    switch (type) {
      case "note": return "bg-blue-100 text-blue-700";
      case "issue": return "bg-red-100 text-red-700";
      case "bookmark": return "bg-green-100 text-green-700";
    }
  };

  const userNotes = teamNotes.filter(note => note.userId === selectedUserId);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Collaboration
          </div>
          {selectedUserId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareSession}
              className="h-7 px-2"
            >
              <Share2 className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedUserId ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Select a user to view team notes and collaboration
          </div>
        ) : (
          <>
            {/* Add New Note */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {(["note", "issue", "bookmark"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={noteType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNoteType(type)}
                    className="h-6 px-2 text-xs"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
              
              <Textarea
                placeholder={`Add a ${noteType} for this user...`}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                size="sm"
                className="w-full h-7"
              >
                <Send className="h-3 w-3 mr-1" />
                Add {noteType.charAt(0).toUpperCase() + noteType.slice(1)}
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Team Notes ({userNotes.length})
              </h4>
              
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {userNotes.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No notes yet for this user
                    </div>
                  ) : (
                    userNotes.map((note) => {
                      const Icon = getTypeIcon(note.type);
                      const colorClass = getTypeColor(note.type);
                      
                      return (
                        <div key={note.id} className="p-2 border rounded-lg">
                          <div className="flex items-start gap-2">
                            <div className={`p-1 rounded-full ${colorClass}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{note.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium">{note.author}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-2 w-2" />
                                  {formatTime(note.timestamp)}
                                </span>
                                <Badge variant="outline" className="h-4 px-1 text-xs">
                                  {note.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
