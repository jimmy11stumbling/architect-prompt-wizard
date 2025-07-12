import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Zap, 
  Clock, 
  Activity,
  Cpu,
  Database,
  TrendingUp,
  TrendingDown,
  Wifi
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
  const getConnectionColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionIcon = (quality: string) => {
    const baseClass = "h-4 w-4";
    switch (quality) {
      case 'excellent': return <Wifi className={`${baseClass} text-green-500`} />;
      case 'good': return <Wifi className={`${baseClass} text-blue-500`} />;
      case 'fair': return <Wifi className={`${baseClass} text-yellow-500`} />;
      case 'poor': return <Wifi className={`${baseClass} text-red-500`} />;
      default: return <Wifi className={`${baseClass} text-gray-500`} />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Throughput</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.tokensPerSecond.toFixed(1)}</p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stats.throughputTrend)}
                    <span className="text-xs text-gray-500">t/s</span>
                  </div>
                </div>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Latency</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.averageLatency}</p>
                  <span className="text-xs text-gray-500">ms</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tokens</p>
                <p className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold">{formatDuration(stats.streamDuration)}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Streaming Performance
            {isActive && (
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Breakdown */}
          <div>
            <h4 className="font-medium mb-3">Token Distribution</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Reasoning Tokens</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(stats.reasoningTokens / stats.totalTokens) * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-sm font-medium w-16 text-right">
                    {stats.reasoningTokens.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Tokens</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(stats.responseTokens / stats.totalTokens) * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-sm font-medium w-16 text-right">
                    {stats.responseTokens.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Quality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Connection Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quality</span>
                  <div className="flex items-center gap-2">
                    {getConnectionIcon(stats.connectionQuality)}
                    <span className={`text-sm font-medium capitalize ${getConnectionColor(stats.connectionQuality)}`}>
                      {stats.connectionQuality}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Buffer Health</span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.bufferHealth} className="w-16 h-2" />
                    <span className="text-sm font-medium">{stats.bufferHealth}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className={`text-sm font-medium ${stats.errorRate > 5 ? 'text-red-600' : stats.errorRate > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {stats.errorRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="text-sm font-medium">{stats.averageLatency}ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peak Throughput</span>
                  <span className="text-sm font-medium">{(stats.tokensPerSecond * 1.2).toFixed(1)} t/s</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Efficiency</span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.min(100, (stats.tokensPerSecond / 50) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Indicators */}
          {isActive && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Real-time streaming active</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Current: {stats.tokensPerSecond.toFixed(1)} t/s
                  </span>
                  <Badge variant="outline" className="animate-pulse">
                    Live Data
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}