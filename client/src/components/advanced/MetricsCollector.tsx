import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Server
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  network: {
    requests: number;
    errors: number;
    avgResponseTime: number;
    throughput: number;
  };
  ai: {
    apiCalls: number;
    tokenUsage: number;
    avgProcessingTime: number;
    errorRate: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

export default function MetricsCollector() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, cores: 4, load: [0, 0, 0] },
    memory: { used: 0, total: 8192, percentage: 0 },
    database: { connections: 0, queries: 0, responseTime: 0, status: 'healthy' },
    network: { requests: 0, errors: 0, avgResponseTime: 0, throughput: 0 },
    ai: { apiCalls: 0, tokenUsage: 0, avgProcessingTime: 0, errorRate: 0 }
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    startMetricsCollection();
    return () => stopMetricsCollection();
  }, []);

  const startMetricsCollection = () => {
    setIsCollecting(true);
    
    // Simulate real-time metrics collection
    const interval = setInterval(() => {
      collectMetrics();
    }, 2000);

    return () => clearInterval(interval);
  };

  const stopMetricsCollection = () => {
    setIsCollecting(false);
  };

  const collectMetrics = async () => {
    try {
      // Simulate collecting real metrics
      const newMetrics: SystemMetrics = {
        cpu: {
          usage: Math.random() * 100,
          cores: 4,
          load: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
        },
        memory: {
          used: Math.random() * 8192,
          total: 8192,
          percentage: Math.random() * 100
        },
        database: {
          connections: Math.floor(Math.random() * 50) + 10,
          queries: Math.floor(Math.random() * 1000) + 100,
          responseTime: Math.random() * 200 + 10,
          status: Math.random() > 0.8 ? 'warning' : 'healthy'
        },
        network: {
          requests: Math.floor(Math.random() * 500) + 50,
          errors: Math.floor(Math.random() * 10),
          avgResponseTime: Math.random() * 1000 + 100,
          throughput: Math.random() * 1000 + 200
        },
        ai: {
          apiCalls: Math.floor(Math.random() * 100) + 20,
          tokenUsage: Math.floor(Math.random() * 10000) + 1000,
          avgProcessingTime: Math.random() * 3000 + 500,
          errorRate: Math.random() * 5
        }
      };

      setMetrics(newMetrics);
      setLastUpdated(new Date());
      
      // Check for alerts
      checkAlerts(newMetrics);
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  };

  const checkAlerts = (currentMetrics: SystemMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    // CPU usage alert
    if (currentMetrics.cpu.usage > 80) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: currentMetrics.cpu.usage > 95 ? 'critical' : 'warning',
        metric: 'CPU Usage',
        value: currentMetrics.cpu.usage,
        threshold: 80,
        message: `CPU usage is ${currentMetrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date()
      });
    }

    // Memory usage alert
    if (currentMetrics.memory.percentage > 85) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: currentMetrics.memory.percentage > 95 ? 'critical' : 'warning',
        metric: 'Memory Usage',
        value: currentMetrics.memory.percentage,
        threshold: 85,
        message: `Memory usage is ${currentMetrics.memory.percentage.toFixed(1)}%`,
        timestamp: new Date()
      });
    }

    // Database response time alert
    if (currentMetrics.database.responseTime > 500) {
      newAlerts.push({
        id: `db-${Date.now()}`,
        type: currentMetrics.database.responseTime > 1000 ? 'critical' : 'warning',
        metric: 'Database Response Time',
        value: currentMetrics.database.responseTime,
        threshold: 500,
        message: `Database response time is ${currentMetrics.database.responseTime.toFixed(0)}ms`,
        timestamp: new Date()
      });
    }

    // AI error rate alert
    if (currentMetrics.ai.errorRate > 2) {
      newAlerts.push({
        id: `ai-${Date.now()}`,
        type: currentMetrics.ai.errorRate > 5 ? 'critical' : 'warning',
        metric: 'AI Error Rate',
        value: currentMetrics.ai.errorRate,
        threshold: 2,
        message: `AI error rate is ${currentMetrics.ai.errorRate.toFixed(1)}%`,
        timestamp: new Date()
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
    }
  };

  const getStatusColor = (value: number, warning: number, critical: number) => {
    if (value >= critical) return 'text-red-500';
    if (value >= warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const refreshMetrics = () => {
    collectMetrics();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Metrics</h2>
        <div className="flex items-center gap-2">
          <Badge variant={isCollecting ? 'default' : 'secondary'}>
            {isCollecting ? 'Collecting' : 'Stopped'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CPU Usage</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.cpu.usage, 70, 90)}`}>
                  {metrics.cpu.usage.toFixed(1)}%
                </p>
              </div>
              <Cpu className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={metrics.cpu.usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Memory Usage</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.memory.percentage, 80, 95)}`}>
                  {metrics.memory.percentage.toFixed(1)}%
                </p>
              </div>
              <Server className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={metrics.memory.percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">DB Response</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.database.responseTime, 300, 500)}`}>
                  {metrics.database.responseTime.toFixed(0)}ms
                </p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(metrics.database.status)}
              <span className="text-sm capitalize">{metrics.database.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Error Rate</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.ai.errorRate, 2, 5)}`}>
                  {metrics.ai.errorRate.toFixed(1)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {metrics.ai.apiCalls} API calls
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">CPU Load (1m, 5m, 15m)</span>
                <div className="flex gap-2">
                  {metrics.cpu.load.map((load, index) => (
                    <Badge key={index} variant="outline">
                      {load.toFixed(2)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="font-medium">
                  {(metrics.memory.used / 1024).toFixed(1)}GB / {(metrics.memory.total / 1024).toFixed(1)}GB
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connections</span>
                <span className="font-medium">{metrics.database.connections}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Network Throughput</span>
                <span className="font-medium">{metrics.network.throughput.toFixed(0)} req/s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Calls</span>
                <span className="font-medium">{metrics.ai.apiCalls}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Token Usage</span>
                <span className="font-medium">{metrics.ai.tokenUsage.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Processing Time</span>
                <span className="font-medium">{metrics.ai.avgProcessingTime.toFixed(0)}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className={`font-medium ${getStatusColor(metrics.ai.errorRate, 2, 5)}`}>
                  {metrics.ai.errorRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' 
                      ? 'border-red-500 bg-red-50' 
                      : alert.type === 'warning'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {alert.type === 'critical' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="font-medium">{alert.metric}</span>
                    </div>
                    <Badge variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Auto-refresh every 2 seconds
        </span>
      </div>
    </div>
  );
}