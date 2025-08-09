import React from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatInputErrorBoundaryProps {
  children: React.ReactNode;
}

interface ChatInputErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChatInputErrorBoundary extends React.Component<
  ChatInputErrorBoundaryProps,
  ChatInputErrorBoundaryState
> {
  constructor(props: ChatInputErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChatInputErrorBoundaryState {
    console.error("ChatInput Error Boundary caught an error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ChatInput Error Boundary details:", {
      error: error.message,
      errorInfo,
      stack: error.stack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 border-t bg-white">
          <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded">
            <div className="text-center">
              <p className="text-red-600 text-sm font-medium">
                Chat input encountered an error
              </p>
              <p className="text-red-500 text-xs mt-1">
                {this.state.error?.message || "Unknown error occurred"}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}