import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ModalProvider } from "./contexts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./design-system";
import { GlobalStateProvider } from "./infrastructure";
import { UIRoot } from "./ui";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Router>
    <React.StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <GlobalStateProvider>
            <ModalProvider>
              <UIRoot />
            </ModalProvider>
          </GlobalStateProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
// reportWebVitals needs to be updated before it can be used. Updating the
// web-vitals package from 2.1.4 to 3.5.0 marked a lot of the existing code
// as deprecated, but because it was not being used it was not updated or
// tested. See: https://github.com/smallwinsdashboard/frontend/pull/89
