"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-danger">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h3 className="font-heading text-2xl">{this.props.fallbackTitle || "Something went wrong"}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            An unexpected error occurred while rendering this section. Please try again.
          </p>
          <Button onClick={this.reset} icon={<RotateCcw className="h-4 w-4" />}>
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
