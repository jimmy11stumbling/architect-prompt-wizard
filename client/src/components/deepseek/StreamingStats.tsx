import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Zap, 
  Brain, 
  Eye, 
  MessageSquare,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';

interface StreamingStatsProps {
  isStreaming: boolean;
  reasoningTokens: number;
  responseTokens: number;
  totalTokens: number;
  streamingSpeed: number;
  elapsedTime: number;
  estimatedCompletion?: number;
}

export function StreamingStats({
  isStreaming,
  reasoningTokens,
  responseTokens,
  totalTokens,
  streamingSpeed,
  elapsedTime,
  estimatedCompletion
}: StreamingStatsProps) {
  const [tokenVelocity, setTokenVelocity] = useState(0);
  const [lastTokenCount, setLastTokenCount] = useState(0);
  const [velocityHistory, setVelocityHistory] = useState<number[]>([]);

  // Calculate real-time token velocity
  useEffect(() => {
    if (isStreaming) {
      const currentTokens = reasoningTokens + responseTokens;
      const velocity = currentTokens - lastTokenCount;
      
      setTokenVelocity(velocity);
      setLastTokenCount(currentTokens);
      
      // Keep last 10 velocity measurements for smoothing
      setVelocityHistory(prev => [...prev.slice(-9), velocity]);
    }
  }, [reasoningTokens, responseTokens, isStreaming, lastTokenCount]);

  const avgVelocity = velocityHistory.length > 0 
    ? velocityHistory.reduce((sum, v) => sum + v, 0) / velocityHistory.length 
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <BarChart3 className="h-4 w-4" />
          Real-time Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Brain className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-gray-300">Reasoning</span>
            </div>
            <div className="text-lg font-mono text-purple-400">
              {reasoningTokens.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-green-400" />
              <span className="text-xs text-gray-300">Response</span>
            </div>
            <div className="text-lg font-mono text-green-400">
              {responseTokens.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-gray-300">Velocity</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {avgVelocity.toFixed(1)} t/s
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-gray-300">Elapsed</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {formatTime(elapsedTime)}
            </Badge>
          </div>

          {estimatedCompletion && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-orange-400" />
                <span className="text-xs text-gray-300">ETA</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {formatTime(estimatedCompletion)}
              </Badge>
            </div>
          )}
        </div>

        {/* Progress Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Progress</span>
            <span className="text-xs text-gray-400">
              {totalTokens.toLocaleString()} total
            </span>
          </div>
          <Progress 
            value={Math.min((totalTokens / 4000) * 100, 100)} 
            className="h-2"
          />
        </div>

        {/* Live Activity Indicator */}
        {isStreaming && (
          <div className="flex items-center justify-center gap-2 p-2 bg-gray-700 rounded-lg">
            <Activity className="h-4 w-4 text-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Live streaming active</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" 
                   style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" 
                   style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StreamingStats;