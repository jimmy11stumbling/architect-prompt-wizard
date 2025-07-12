import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Clock, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface StreamingStatusBarProps {
  isConnected: boolean;
  isStreaming: boolean;
  stage: 'idle' | 'connecting' | 'reasoning' | 'responding' | 'complete' | 'error';
  reasoningTokens: number;
  responseTokens: number;
  elapsedTime: number;
  estimatedTotal?: number;
  error?: string;
}

export function StreamingStatusBar({
  isConnected,
  isStreaming,
  stage,
  reasoningTokens,
  responseTokens,
  elapsedTime,
  estimatedTotal,
  error
}: StreamingStatusBarProps) {
  const getStageInfo = () => {
    switch (stage) {
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Connecting to DeepSeek...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-950/50'
        };
      case 'reasoning':
        return {
          icon: <Activity className="h-4 w-4 animate-pulse" />,
          text: 'AI Reasoning in Progress',
          color: 'text-purple-400',
          bgColor: 'bg-purple-950/50'
        };
      case 'responding':
        return {
          icon: <Zap className="h-4 w-4 animate-pulse" />,
          text: 'Generating Response',
          color: 'text-green-400',
          bgColor: 'bg-green-950/50'
        };
      case 'complete':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Response Complete',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-950/50'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: error || 'Error occurred',
          color: 'text-red-400',
          bgColor: 'bg-red-950/50'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Ready',
          color: 'text-gray-400',
          bgColor: 'bg-gray-950/50'
        };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTokens = reasoningTokens + responseTokens;
  const progressPercentage = estimatedTotal 
    ? Math.min((totalTokens / estimatedTotal) * 100, 100)
    : Math.min((totalTokens / 2000) * 100, 100); // Default estimate

  const stageInfo = getStageInfo();

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t border-gray-700 ${stageInfo.bgColor} backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Status */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <Badge variant="outline" className="text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            {/* Stage Status */}
            <div className={`flex items-center gap-2 ${stageInfo.color}`}>
              {stageInfo.icon}
              <span className="text-sm font-medium">{stageInfo.text}</span>
            </div>

            {/* Token Counters */}
            {isStreaming && (
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-400">{reasoningTokens}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">{responseTokens}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Progress and Time */}
          <div className="flex items-center gap-4">
            {/* Progress Bar */}
            {isStreaming && (
              <div className="flex items-center gap-2">
                <Progress 
                  value={progressPercentage} 
                  className="w-32 h-2"
                />
                <span className="text-xs text-gray-400">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
            )}

            {/* Elapsed Time */}
            {elapsedTime > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            )}

            {/* Live Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-400">LIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreamingStatusBar;