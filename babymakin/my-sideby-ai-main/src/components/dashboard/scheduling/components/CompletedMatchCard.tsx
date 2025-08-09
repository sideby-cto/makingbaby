
import React from "react";
import { MatchData } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { MatchNotesDialog } from "./MatchNotesDialog";

interface CompletedMatchCardProps {
  match: MatchData;
  userId: string;
}

export const CompletedMatchCard = ({ match, userId }: CompletedMatchCardProps) => {
  // Determine if current user is user1 or user2
  const isUser1 = match.user1_id === userId;
  const partner = isUser1 ? match.user2 : match.user1;
  
  // Get partner info with proper fallbacks
  let partnerName = 'Partner';
  if (partner && partner.first_name && partner.first_name.trim() !== '') {
    partnerName = `${partner.first_name} ${partner.last_name || ''}`.trim();
  } else if (partner && partner.first_name === 'Unknown') {
    // If the database has "Unknown" as the name, we should still display it as "Partner"
    partnerName = 'Partner';
  }
  
  const partnerInitial = partnerName.charAt(0).toUpperCase();
  const partnerAvatar = partner?.avatar_url;
  
  // Format completion date
  const completedDate = match.completed_at 
    ? format(new Date(match.completed_at), "MMM d, yyyy") 
    : "Unknown";

  console.log('CompletedMatchCard partner data:', { 
    matchId: match.id,
    isUser1, 
    partner, 
    partnerName,
    partnerFirstName: partner?.first_name,
    partnerLastName: partner?.last_name
  });

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            {partnerAvatar ? (
              <AvatarImage src={partnerAvatar} alt={partnerName} />
            ) : (
              <AvatarFallback>{partnerInitial}</AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{partnerName}</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              Completed: {completedDate}
            </p>
            
            {match.completion_notes && (
              <div className="text-sm bg-muted/30 p-2 rounded mb-3">
                <p className="text-muted-foreground">{match.completion_notes}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <MatchNotesDialog 
                matchId={match.id}
                userId={userId}
                partnerName={partnerName}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
