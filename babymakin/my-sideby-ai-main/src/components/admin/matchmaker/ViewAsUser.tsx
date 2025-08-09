
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface UserOption {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  pacing?: string;
}

export const ViewAsUser: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["users-for-impersonation"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            email,
            first_name,
            last_name,
            user_pacing_preferences(pacing_level)
          `)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        return data.map((user) => ({
          id: user.id,
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          pacing: user.user_pacing_preferences?.[0]?.pacing_level,
        })) as UserOption[];
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users for impersonation",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const filteredUsers = users?.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const handleImpersonate = async () => {
    if (!selectedUserId) {
      toast({
        title: "Select a user",
        description: "Please select a user to impersonate",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get the admin's user ID
      const { data: adminUserData, error: adminError } = await supabase.auth.getUser();
      if (adminError) throw adminError;

      const adminId = adminUserData.user?.id;
      if (!adminId) {
        throw new Error("Admin user not found");
      }

      console.log(`Setting impersonation: admin ${adminId} impersonating user ${selectedUserId}`);

      // Update the admin's profile with the impersonating_user_id
      const { error } = await supabase
        .from("profiles")
        .update({ impersonating_user_id: selectedUserId })
        .eq("id", adminId);

      if (error) {
        console.error("Error setting impersonation:", error);
        throw error;
      }

      // Invalidate profile query to ensure we get fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: "Success",
        description: "Impersonating user. Opening dashboard...",
      });

      // Open dashboard in new tab
      window.open("/dashboard", "_blank");
    } catch (error) {
      console.error("Error impersonating user:", error);
      toast({
        title: "Error",
        description: "Failed to impersonate user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopImpersonating = async () => {
    setIsLoading(true);
    try {
      const { data: adminUserData, error: adminError } = await supabase.auth.getUser();
      if (adminError) throw adminError;

      const adminId = adminUserData.user?.id;
      if (!adminId) {
        throw new Error("Admin user not found");
      }

      console.log(`Stopping impersonation for admin ${adminId}`);

      const { error } = await supabase
        .from("profiles")
        .update({ impersonating_user_id: null })
        .eq("id", adminId);

      if (error) {
        console.error("Error stopping impersonation:", error);
        throw error;
      }

      // Invalidate profile query to ensure we get fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: "Success",
        description: "Stopped impersonating",
      });

      // Refresh the page to apply changes
      window.location.href = "/admin";
    } catch (error) {
      console.error("Error stopping impersonation:", error);
      toast({
        title: "Error",
        description: "Failed to stop impersonating",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>View As User</CardTitle>
        <CardDescription>
          Impersonate a user to see sideby from their perspective
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-search">Search by email</Label>
          <Input
            id="email-search"
            type="text"
            placeholder="Search user by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-select">Select user</Label>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredUsers?.length === 0 ? (
                  <div className="py-2 text-center text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  filteredUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {user.first_name} {user.last_name}{" "}
                          <span className="text-muted-foreground">
                            ({user.email})
                          </span>
                        </span>
                        {user.pacing && (
                          <Badge variant="outline" className="ml-auto">
                            {user.pacing}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleStopImpersonating}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Stop Impersonating"
          )}
        </Button>
        <Button 
          onClick={handleImpersonate} 
          disabled={!selectedUserId || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              View As Selected User
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
