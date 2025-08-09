
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { resetUserData } from "@/utils/admin/userReset";
import type { ResetUserResult } from "@/utils/admin/userReset";

interface UserResetToolProps {
  className?: string;
}

export const UserResetTool: React.FC<UserResetToolProps> = ({ className }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "warning" | "info">("idle");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const handleReset = async () => {
    setStatus("loading");
    setMessage("Resetting user data...");
    setResults([]);

    try {
      const result: ResetUserResult = await resetUserData(email);
      
      setResults(result.logs || []);
      
      if ('success' in result && result.success === false) {
        setStatus("error");
        setMessage(result.error || "Unknown error occurred");
      } else if ('partialSuccess' in result) {
        setStatus("warning");
        setMessage(result.message || "Partial success with some issues");
      } else if ('success' in result && result.success) {
        if ('alreadyDeleted' in result) {
          setStatus("info");
          setMessage("User may have already been deleted");
        } else {
          setStatus("success");
          setMessage("User data has been successfully reset");
        }
      }
    } catch (error) {
      console.error("Error during reset:", error);
      setStatus("error");
      setMessage("An unexpected error occurred");
      toast({
        title: "Error",
        description: "Failed to reset user data",
        variant: "destructive",
      });
    } finally {
      setStatus(status === "loading" ? "idle" : status);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>User Reset Tool</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="user@example.com"
            disabled={status === "loading"}
          />
        </div>
        <Button onClick={handleReset} disabled={status === "loading" || !email}>
          {status === "loading" ? "Resetting..." : "Reset User Data"}
        </Button>
        {status !== "idle" && (
          <div className={`mt-4 p-3 rounded-md ${
            status === "success" ? "bg-green-100 text-green-700" :
            status === "error" ? "bg-red-100 text-red-700" :
            status === "warning" ? "bg-yellow-100 text-yellow-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            <p className="font-semibold">{message}</p>
            {results.length > 0 && (
              <ul className="list-disc pl-5 mt-2">
                {results.map((result, index) => (
                  <li key={index}>{result}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
