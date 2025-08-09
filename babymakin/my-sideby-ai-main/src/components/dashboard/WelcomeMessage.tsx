import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const WelcomeMessage = () => {
  const { user } = useAuth();

  return (
    <Card data-testid="welcome-message-card">
      <CardHeader>
        <CardTitle data-testid="welcome-message-title">
          Welcome to sideby
        </CardTitle>
      </CardHeader>
      <CardContent data-testid="welcome-message-content">
        <p className="text-muted-foreground">
          Hello! Ready to connect with other educators?
        </p>
      </CardContent>
    </Card>
  );
};