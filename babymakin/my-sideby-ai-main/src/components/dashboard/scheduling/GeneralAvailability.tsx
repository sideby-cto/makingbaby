
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface GeneralAvailabilityProps {
  userPacing: string;
}

const GeneralAvailability: React.FC<GeneralAvailabilityProps> = ({ userPacing }) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Scheduling Feature
        </CardTitle>
        <CardDescription>
          This feature is currently under development
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Coming Soon</h3>
          <p className="text-gray-500">
            We're working on improving the scheduling feature. Check back later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralAvailability;
