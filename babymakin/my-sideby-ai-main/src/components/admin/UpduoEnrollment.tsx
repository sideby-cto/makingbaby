
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Bug, Users, AlertCircle } from "lucide-react";

export const UpduoEnrollment = () => {
  const [firstName, setFirstName] = useState("mikeme");
  const [lastName, setLastName] = useState("mendelson");
  const [email, setEmail] = useState("mikeme@upduo.com");
  const [loading, setLoading] = useState(false);
  const [debugEmail, setDebugEmail] = useState("mikeme@upduo.com");
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);
  const { toast } = useToast();

  const handleEnroll = async () => {
    if (!firstName || !lastName || !email) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("manual-upduo-integration", {
        body: { email },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Enrollment successful",
        description: `${firstName} ${lastName} has been manually enrolled in Upduo`,
      });

      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
    } catch (error) {
      console.error("Error enrolling user in Upduo:", error);
      toast({
        title: "Enrollment failed",
        description: error.message || "Could not enroll user in Upduo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDebugCheck = async () => {
    if (!debugEmail) {
      toast({
        title: "Missing email",
        description: "Please enter an email to check",
        variant: "destructive",
      });
      return;
    }

    setDebugLoading(true);
    setDebugResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("debug-upduo-integration", {
        body: { action: "check_status", email: debugEmail },
      });

      if (error) {
        throw error;
      }

      setDebugResult(data);
      toast({
        title: "Debug check complete",
        description: `Status for ${debugEmail}: ${data.profile?.upduo_status || 'Not found'}`,
      });
    } catch (error) {
      console.error("Error checking user status:", error);
      toast({
        title: "Debug check failed",
        description: error.message || "Could not check user status",
        variant: "destructive",
      });
    } finally {
      setDebugLoading(false);
    }
  };

  const handleGetSummary = async () => {
    setDebugLoading(true);
    setDebugResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("debug-upduo-integration", {
        body: { action: "integration_summary" },
      });

      if (error) {
        throw error;
      }

      setDebugResult(data);
      toast({
        title: "Summary retrieved",
        description: `Total users: ${data.summary?.total_users}, Success: ${data.summary?.success}, Failed: ${data.summary?.failed}`,
      });
    } catch (error) {
      console.error("Error getting summary:", error);
      toast({
        title: "Summary failed",
        description: error.message || "Could not get integration summary",
        variant: "destructive",
      });
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manual Upduo Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <Button 
              onClick={handleEnroll} 
              disabled={loading || !firstName || !lastName || !email}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Manually Enroll in Upduo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Upduo Integration Debug Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={debugEmail}
                onChange={(e) => setDebugEmail(e.target.value)}
                placeholder="Email to check status"
                className="flex-1"
              />
              <Button 
                onClick={handleDebugCheck} 
                disabled={debugLoading || !debugEmail}
                variant="outline"
              >
                {debugLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Status
              </Button>
            </div>
            
            <Button 
              onClick={handleGetSummary} 
              disabled={debugLoading}
              variant="outline"
              className="w-full"
            >
              {debugLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Users className="mr-2 h-4 w-4" />
              Get Integration Summary
            </Button>

            {debugResult && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Debug Results
                </h4>
                <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
