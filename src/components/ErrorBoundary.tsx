import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error for monitoring
    this.logError(error, errorInfo);

    // Show user-friendly toast
    toast({
      title: "Something went wrong",
      description: "We're working to fix this issue. Please try again.",
      variant: "destructive"
    });
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    // In production, this would send to error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store locally for now (in production, send to monitoring service)
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push(errorReport);
    
    // Keep only last 100 errors
    if (errors.length > 100) {
      errors.splice(0, errors.length - 100);
    }
    
    localStorage.setItem('app_errors', JSON.stringify(errors));
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              We apologize for the inconvenience. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
