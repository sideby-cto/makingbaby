import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, User, Bot, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TranscriptSuccessTagDialog } from "./TranscriptSuccessTagDialog";
import { useStudentSuccessSigns } from "@/hooks/useStudentSuccessSigns";
import { SIGN_TYPE_LABELS } from "@/types/student-success";

interface TranscriptMessage {
  speaker: string;
  content: string;
  timestamp: string;
  speaker_type?: 'user' | 'admin' | 'system';
}

interface TranscriptAnalyzerData {
  id: string;
  user_id: string;
  conversation_id: string;
  transcript: {
    messages?: TranscriptMessage[];
    conversation?: TranscriptMessage[];
  };
  created_at: string;
  word_count: number;
  quality_score: number;
  student_name?: string;
}

interface TranscriptAnalyzerProps {
  transcript: TranscriptAnalyzerData;
  studentId: string;
  studentName: string;
}

export const TranscriptAnalyzer = ({ transcript, studentId, studentName }: TranscriptAnalyzerProps) => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: existingSigns = [] } = useStudentSuccessSigns(studentId);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      setSelectedText(selectedText);
      setShowTagDialog(true);
    }
  };

  const messages = transcript.transcript?.messages || transcript.transcript?.conversation || [];
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = !searchTerm || 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || 
      (filterType === "student" && msg.speaker_type === "user") ||
      (filterType === "admin" && msg.speaker_type === "admin");
    
    return matchesSearch && matchesType;
  });

  const getMessageIcon = (speaker_type?: string) => {
    switch (speaker_type) {
      case 'admin':
        return <Bot className="h-4 w-4 text-blue-600" />;
      case 'user':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const highlightSuccessIndicators = (text: string) => {
    // Simple pattern matching for potential success indicators
    const patterns = [
      /\b(understand|got it|makes sense|i see|that's right)\b/gi,
      /\b(excited|love|enjoy|fun|interesting|cool)\b/gi,
      /\b(keep going|don't give up|try again|persist)\b/gi,
      /\b(work together|collaborate|help each other)\b/gi,
      /\b(creative|innovative|unique|original)\b/gi,
      /\b(participate|contribute|share|discuss)\b/gi,
    ];

    let highlightedText = text;
    patterns.forEach((pattern, index) => {
      const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-orange-100'];
      highlightedText = highlightedText.replace(pattern, (match) => 
        `<span class="px-1 rounded ${colors[index % colors.length]} cursor-pointer" title="Potential success indicator">${match}</span>`
      );
    });

    return highlightedText;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcript Analysis - {studentName}
            </CardTitle>
            <Badge variant="outline">
              {messages.length} messages
            </Badge>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by speaker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="student">Student Only</SelectItem>
                <SelectItem value="admin">Admin Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <div className="space-y-4">
              {filteredMessages.map((message, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    {getMessageIcon(message.speaker_type)}
                    <span className="font-medium text-sm">{message.speaker}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <div 
                    className="text-sm leading-relaxed select-text cursor-text"
                    onMouseUp={handleTextSelection}
                    dangerouslySetInnerHTML={{ 
                      __html: highlightSuccessIndicators(message.content) 
                    }}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Quick Analysis Tips
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <span className="px-1 bg-blue-100 rounded">Blue highlights</span> indicate comprehension signs</li>
              <li>• <span className="px-1 bg-green-100 rounded">Green highlights</span> show engagement patterns</li>
              <li>• <span className="px-1 bg-yellow-100 rounded">Yellow highlights</span> suggest persistence</li>
              <li>• Select any text to create a custom success sign</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Existing Success Signs */}
      {existingSigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Existing Success Signs ({existingSigns.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {existingSigns.slice(0, 4).map((sign) => (
                <div key={sign.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {SIGN_TYPE_LABELS[sign.sign_type]}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(sign.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{sign.description}</p>
                </div>
              ))}
            </div>
            {existingSigns.length > 4 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                +{existingSigns.length - 4} more signs recorded
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <TranscriptSuccessTagDialog
        open={showTagDialog}
        onOpenChange={setShowTagDialog}
        selectedText={selectedText}
        studentId={studentId}
        studentName={studentName}
        transcriptId={transcript.id}
      />
    </div>
  );
};
