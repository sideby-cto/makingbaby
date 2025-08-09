
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./Routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SessionRecoveryIndicator } from "@/components/upduo/SessionRecoveryIndicator";
import { NavigationGuard } from "@/components/navigation/NavigationGuard";
import { useChaosNavigationHandler } from "@/hooks/useChaosNavigationHandler";
import { RootProviders } from "@/app/RootProviders";

function App() {
  return (
    <ErrorBoundary>
      <RootProviders>
        <BrowserRouter>
          <AppWithRouter />
          <SessionRecoveryIndicator />
        </BrowserRouter>
      </RootProviders>
    </ErrorBoundary>
  );
}


// Move the navigation handler inside the router
function AppWithRouter() {
  // Handle chaos testing navigation events inside router context
  useChaosNavigationHandler();

  return (
    <>
      <NavigationGuard />
      <AppRoutes />
    </>
  );
}

export default App;
