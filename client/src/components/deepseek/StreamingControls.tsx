import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Settings,
  Activity,
  Zap,
  Clock
} from 'lucide-react';

interface StreamingControlsProps {
  isStreaming: boolean;
  isPaused: boolean;
  canResume: boolean;
  streamingProgress: number;
  tokensReceived: number;
  elapsedTime: number;
  tokenVelocity: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export default function StreamingControls({
  isStreaming,
  isPaused,
  canResume,
  streamingProgress,
  tokensReceived,
  elapsedTime,
  tokenVelocity,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  disabled = false
}: StreamingControlsProps) {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (isStreaming && !isPaused) {
      return <Badge className="bg-green-100 text-green-800">Streaming</Badge>;
    } else if (isPaused) {
      return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
    } else if (canResume) {
      return <Badge className="bg-blue-100 text-blue-800">Ready to Resume</Badge>;
    } else {
      return <Badge variant="secondary">Stopped</Badge>;
    }
  };

  const getProgressColor = () => {
    if (isPaused) return 'bg-yellow-500';
    if (isStreaming) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-blue-500" />
          <span className="font-medium">Streaming Controls</span>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{streamingProgress.toFixed(1)}%</span>
        </div>
        <div className="relative">
          <Progress 
            value={streamingProgress} 
            className="h-2"
          />
          {isStreaming && !isPaused && (
            <div className="absolute top-0 left-0 h-2 w-full rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Tokens Received</span>
          <span className="font-medium">{tokensReceived.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Velocity</span>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-orange-500" />
            <span className="font-medium">{tokenVelocity.toFixed(1)} t/s</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {!isStreaming && !canResume && (
          <Button
            onClick={onStart}
            disabled={disabled}
            className="flex items-center gap-2"
            size="sm"
          >
            <Play className="h-4 w-4" />
            Start Stream
          </Button>
        )}
        
        {isStreaming && !isPaused && (
          <Button
            onClick={onPause}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        )}
        
        {isPaused && canResume && (
          <Button
            onClick={onResume}
            disabled={disabled}
            className="flex items-center gap-2"
            size="sm"
          >
            <Play className="h-4 w-4" />
            Resume
          </Button>
        )}
        
        {(isStreaming || isPaused || canResume) && (
          <Button
            onClick={onStop}
            disabled={disabled}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}
        
        <Button
          onClick={onReset}
          disabled={disabled || isStreaming}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className={`w-2 h-2 rounded-full ${
          isStreaming && !isPaused ? 'bg-green-500 animate-pulse' : 
          isPaused ? 'bg-yellow-500' : 
          'bg-gray-300'
        }`}></div>
        <span>
          {isStreaming && !isPaused ? 'Live streaming in progress' :
           isPaused ? 'Stream paused - ready to resume' :
           canResume ? 'Stream available for resumption' :
           'Ready to start new stream'}
        </span>
      </div>
    </div>
  );
}