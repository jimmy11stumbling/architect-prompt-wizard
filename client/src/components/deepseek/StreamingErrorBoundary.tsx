import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Bug, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class StreamingErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StreamingErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-500 bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Streaming Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="gap-1">
                  <Bug className="h-3 w-3" />
                  Error
                </Badge>
                <span className="text-sm text-gray-300">
                  {this.state.error?.message || 'Unknown error occurred'}
                </span>
              </div>
              
              {this.state.error?.stack && (
                <details className="text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-300">
                    View Error Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-900 rounded border border-gray-700 overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Reload Page
              </Button>
            </div>

            <div className="text-xs text-gray-400 bg-gray-900 rounded p-3 border border-gray-700">
              <p className="font-medium mb-1">Troubleshooting Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Verify DeepSeek API key is valid</li>
                <li>Try refreshing the page</li>
                <li>Check browser console for additional errors</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default StreamingErrorBoundary;