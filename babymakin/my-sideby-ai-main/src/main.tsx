
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createOptimizedQueryClient, monitorQueryCache } from "@/lib/optimizedQueryClient";
import App from "./App.tsx";
import "./index.css";

// Create the optimized query client
const queryClient = createOptimizedQueryClient();

// Enable cache monitoring in development
if (process.env.NODE_ENV === 'development') {
  monitorQueryCache(queryClient);
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
