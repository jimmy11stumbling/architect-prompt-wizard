
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Clock,
  Zap
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
  streamingProgress,
  tokensReceived,
  elapsedTime,
  tokenVelocity
}: StreamingControlsProps) {

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (isStreaming && !isPaused) {
      return <Badge className="bg-green-600 text-white">Streaming</Badge>;
    } else if (isPaused) {
      return <Badge className="bg-yellow-600 text-white">Paused</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-600 text-white">Ready</Badge>;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className={`h-5 w-5 ${isStreaming ? 'text-green-400 animate-pulse' : 'text-blue-400'}`} />
          <span className="font-medium text-white">Streaming Status</span>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock className="h-4 w-4" />
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Progress</span>
          <span className="text-white">{streamingProgress.toFixed(1)}%</span>
        </div>
        <div className="relative">
          <Progress 
            value={streamingProgress} 
            className="h-2 bg-gray-700"
          />
          {isStreaming && !isPaused && (
            <div className="absolute top-0 left-0 h-2 w-full rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Tokens Received</span>
          <span className="font-medium text-green-400">{tokensReceived.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Velocity</span>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-orange-400" />
            <span className="font-medium text-orange-400">{tokenVelocity.toFixed(1)} t/s</span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className={`w-2 h-2 rounded-full ${
          isStreaming && !isPaused ? 'bg-green-400 animate-pulse' : 
          isPaused ? 'bg-yellow-400' : 
          'bg-gray-500'
        }`}></div>
        <span>
          {isStreaming && !isPaused ? 'Live streaming in progress' :
           isPaused ? 'Stream paused' :
           'Ready for new query'}
        </span>
      </div>
    </div>
  );
}
