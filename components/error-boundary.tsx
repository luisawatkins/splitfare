'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6">
          <div className="bg-rose-100 p-4 rounded-full text-rose-600">
            <AlertTriangle size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Something went wrong</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              {this.state.error?.message || "An unexpected error occurred. Don't worry, your funds are safe."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={this.handleRetry} variant="default" className="gap-2">
              <RefreshCcw size={16} />
              Retry Connection
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/dashboard">
                <Home size={16} />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return this.childrenWithBoundary(this.props.children);
  }

  private childrenWithBoundary(children: ReactNode) {
    return children;
  }
}

export function NetworkError({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-4 bg-slate-50/50">
      <div className="mx-auto w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
        <RefreshCcw size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900">Network Error</h3>
        <p className="text-sm text-slate-500">
          {message || "We couldn't connect to the network. Please check your connection."}
        </p>
      </div>
      <Button onClick={onRetry} variant="outline" size="sm" className="rounded-full px-6">
        Try Again
      </Button>
    </div>
  );
}
