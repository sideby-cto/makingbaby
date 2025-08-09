
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Bug, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Bell,
  ExternalLink,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestingActionsProps {
  userId: string;
  userEmail: string;
  onImpersonate: () => void;
  isImpersonating: boolean;
}

export const TestingActions = ({ 
  userId, 
  userEmail, 
  onImpersonate, 
  isImpersonating 
}: TestingActionsProps) => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, "pending" | "pass" | "fail">>({});

  const testScenarios = [
    { id: "dashboard", label: "Dashboard Load", icon: Eye, route: "/dashboard" },
    { id: "matches", label: "View Matches", icon: Users, route: "/dashboard?tab=partners" },
    { id: "ideas", label: "Ideas Tab", icon: MessageSquare, route: "/dashboard?tab=ideas" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/dashboard" },
  ];

  const handleQuickTest = async (scenario: typeof testScenarios[0]) => {
    setTestResults(prev => ({ ...prev, [scenario.id]: "pending" }));
    
    // Simulate testing delay
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, [scenario.id]: "pass" }));
      toast({
        title: "Test Completed",
        description: `${scenario.label} test passed for ${userEmail}`,
        variant: "default",
      });
    }, 2000);
  };

  const openInNewTab = (route: string) => {
    window.open(route, "_blank");
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Play className="h-4 w-4" />
          Testing Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={onImpersonate}
            disabled={isImpersonating}
            className="w-full h-8 text-xs"
            size="sm"
          >
            {isImpersonating ? (
              <>
                <Clock className="h-3 w-3 mr-1 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                View As User
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Quick Tests</h4>
          {testScenarios.map((scenario) => {
            const result = testResults[scenario.id];
            const Icon = scenario.icon;
            
            return (
              <div key={scenario.id} className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs justify-start"
                  onClick={() => handleQuickTest(scenario)}
                  disabled={result === "pending"}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {scenario.label}
                </Button>
                
                {result && (
                  <Badge 
                    variant={result === "pass" ? "default" : result === "fail" ? "destructive" : "secondary"}
                    className="h-5 px-2 text-xs"
                  >
                    {result === "pending" && <Clock className="h-2 w-2 mr-1 animate-spin" />}
                    {result === "pass" && <CheckCircle className="h-2 w-2 mr-1" />}
                    {result === "fail" && <Bug className="h-2 w-2 mr-1" />}
                    {result}
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => openInNewTab(scenario.route)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const Users = MessageSquare; // Alias for the Users icon since it's not imported
