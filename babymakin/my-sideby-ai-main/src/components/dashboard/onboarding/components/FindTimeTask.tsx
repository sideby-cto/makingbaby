
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, Clock, MessageSquare } from "lucide-react";
interface FindTimeTaskProps {
  activeMatchId?: string | null;
  suggestedCompletion: {
    date: string;
    pacingLabel: string;
    days: number;
  };
  onHelp?: () => void;
  onFinished?: () => void;
}
export const FindTimeTask: React.FC<FindTimeTaskProps> = ({
  activeMatchId,
  suggestedCompletion,
  onHelp,
  onFinished
}) => {
  const navigate = useNavigate();
  const handleGoToChat = () => {
    if (activeMatchId) {
      navigate(`/dashboard/match/${activeMatchId}`);
    } else {
      navigate('/dashboard');
    }
  };
  return <Card className="border-2 border-primary/20 overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-primary/5 relative">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">Find Time Together</CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 px-3 py-1 font-semibold shadow-sm">Next Step</Badge>
        </div>
        <CardDescription className="text-gray-700">Connect with your learning partner to schedule your sideby session.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <Alert className="bg-blue-50 border-blue-100">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <AlertDescription className="text-sm text-gray-700">
            <span className="font-medium block mb-1">Send a message your partner</span>
            Introduce yourself and find a time that works for both of you to have a sideby session. 
            We recommend scheduling 20 minutes for each chat.
          </AlertDescription>
        </Alert>
        
        <Alert className="bg-amber-50 border-amber-100">
          <Clock className="h-5 w-5 text-amber-500" />
          <AlertDescription className="text-sm text-gray-700">
            <span className="font-medium block mb-1">Suggested completion by {suggestedCompletion.date}</span>
            To keep your pace, try to schedule this conversation within the next {suggestedCompletion.days} days.
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-4 bg-gray-50 border-t">
        <Button variant="ghost" size="sm" onClick={onHelp}>
          <Clock className="h-4 w-4 mr-2" />
          <span>Help</span>
        </Button>
        
        <Button variant="default" size="sm" onClick={handleGoToChat} className="bg-primary hover:bg-primary/90">
          <MessageSquare className="h-4 w-4 mr-2" />
          <span>Find Time</span>
        </Button>
      </CardFooter>
    </Card>;
};
