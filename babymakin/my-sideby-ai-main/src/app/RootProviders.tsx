import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { FeatureFlagsProvider } from "@/contexts/FeatureFlagsContext";
import { NotificationProvider } from "@/contexts/notification";
import { LoggerProvider } from "@/contexts/LoggerContext";
import { AuthProvider } from "@/hooks/useAuth";
import { MessageProvider } from "@/contexts/MessageContext";
import { SelectedMatchProvider } from "@/contexts/SelectedMatchContext";
import { UpduoSessionProvider } from "@/contexts/UpduoSessionContext";

interface RootProvidersProps { children: ReactNode }

export function RootProviders({ children }: RootProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LoggerProvider>
        <AuthProvider>
          <UpduoSessionProvider>
            <MessageProvider>
              <SelectedMatchProvider>
                <FeatureFlagsProvider>
                  <NotificationProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      {children}
                    </TooltipProvider>
                  </NotificationProvider>
                </FeatureFlagsProvider>
              </SelectedMatchProvider>
            </MessageProvider>
          </UpduoSessionProvider>
        </AuthProvider>
      </LoggerProvider>
    </ThemeProvider>
  );
}
