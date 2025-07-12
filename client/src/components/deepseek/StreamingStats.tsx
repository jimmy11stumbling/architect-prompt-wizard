import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Wifi,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface StreamingStatsProps {
  stats: {
    tokensPerSecond: number;
    averageLatency: number;
    totalTokens: number;
    reasoningTokens: number;
    responseTokens: number;
    streamDuration: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
    bufferHealth: number;
    throughputTrend: 'up' | 'down' | 'stable';
    errorRate: number;
  };
  isActive: boolean;
}

export default function StreamingStats({ stats, isActive }: StreamingStatsProps) {
  const getConnectionIcon = () => {
    switch (stats.connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-400" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-blue-400" />;
      case 'fair':
        return <Wifi className="h-4 w-4 text-yellow-400" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-red-400" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = () => {
    switch (stats.throughputTrend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      case 'stable':
        return <Minus className="h-3 w-3 text-yellow-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <BarChart3 className="h-4 w-4 text-purple-400" />
          Streaming Analytics
          {isActive && (
            <Badge className="bg-green-600 text-white ml-auto">
              <Activity className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Throughput</span>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-400" />
                <span className="font-mono text-orange-400">
                  {stats.tokensPerSecond.toFixed(1)} t/s
                </span>
                {getTrendIcon()}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Latency</span>
              <span className="font-mono text-blue-400">
                {stats.averageLatency}ms
              </span>
            </div>
          </div>
        </div>

        {/* Token Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Token Distribution</span>
            <span className="text-gray-300">{stats.totalTokens} total</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-300">Reasoning</span>
              <span className="font-mono">{stats.reasoningTokens}</span>
            </div>
            <Progress 
              value={(stats.reasoningTokens / Math.max(stats.totalTokens, 1)) * 100} 
              className="h-1"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-300">Response</span>
              <span className="font-mono">{stats.responseTokens}</span>
            </div>
            <Progress 
              value={(stats.responseTokens / Math.max(stats.totalTokens, 1)) * 100} 
              className="h-1"
            />
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-xs text-gray-400">Connection</span>
            </div>
            <span className={`text-xs font-medium ${
              stats.connectionQuality === 'excellent' ? 'text-green-400' :
              stats.connectionQuality === 'good' ? 'text-blue-400' :
              stats.connectionQuality === 'fair' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {stats.connectionQuality}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Buffer Health</span>
              <span className="text-green-400">{stats.bufferHealth}%</span>
            </div>
            <Progress value={stats.bufferHealth} className="h-1" />
          </div>
        </div>

        {/* Error Rate */}
        {stats.errorRate > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="h-3 w-3 text-yellow-400" />
            <span className="text-gray-400">Error Rate:</span>
            <span className="text-yellow-400">{stats.errorRate.toFixed(1)}%</span>
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-700">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-gray-400">Duration</span>
          </div>
          <span className="font-mono text-gray-300">
            {formatDuration(stats.streamDuration)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}