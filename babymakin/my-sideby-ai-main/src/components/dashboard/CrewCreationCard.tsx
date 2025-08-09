
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const CrewCreationCard = () => {
  return (
    <Card className="border-[#FF5733]/20 shadow-md opacity-75">
      <CardHeader className="bg-gradient-to-r from-[#FFF0ED] to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#FF5733] flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create a Crew
          </CardTitle>
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          Build your own learning community with custom crews. Invite colleagues, set learning goals, and collaborate on educational projects.
        </p>
        <Button 
          disabled 
          className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
        >
          Create Your Crew
        </Button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This feature will be available soon. Stay tuned!
        </p>
      </CardContent>
    </Card>
  );
};
