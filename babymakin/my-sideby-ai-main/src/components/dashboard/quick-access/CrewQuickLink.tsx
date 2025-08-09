
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

export const CrewQuickLink = () => {
  return (
    <Link 
      to="/crew-code"
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 text-primary rounded-full">
          <Users className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-foreground">Join Crew</p>
          <p className="text-sm text-muted-foreground">Enter your crew code</p>
        </div>
      </div>
    </Link>
  );
};
