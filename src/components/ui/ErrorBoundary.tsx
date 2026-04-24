"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      const sentry = (window as Window & { Sentry?: { captureException: (e: Error, context?: unknown) => void } }).Sentry;
      sentry?.captureException(error, { extra: errorInfo });
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 glass-card border-[var(--error)]/30 m-4">
          <div className="w-16 h-16 bg-[var(--error)]/10 text-[var(--error)] rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl mb-2 font-[family-name:var(--font-syne)]">Neural Interface Failure</h2>
          <p className="text-gray-400 text-center mb-8 max-w-md font-[family-name:var(--font-instrument)]">
            A critical error occurred while processing neural data. Our systems are working to restore connectivity.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-[var(--primary)] rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reboot Systems</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
