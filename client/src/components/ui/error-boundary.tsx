import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
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
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
          <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-6 w-6" />
                <CardTitle className="text-xl">Something went wrong</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                The application encountered an unexpected error. Please try refreshing the page or resetting the component.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">Error Details (Development Mode)</h4>
                  <div className="text-sm text-slate-300 space-y-2">
                    <div>
                      <span className="font-medium">Error:</span> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <span className="font-medium">Stack:</span>
                        <pre className="mt-1 text-xs bg-slate-800 p-2 rounded overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={this.handleTryAgain} variant="default">
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}