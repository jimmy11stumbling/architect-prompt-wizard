import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Clock, 
  Database, 
  Cpu, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';

export interface SystemMetrics {
  timestamp: Date;
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  usage: {
    activeUsers: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
  };
  ai: {
    agentExecutions: number;
    averageAgentTime: number;
    ragQueries: number;
    mcpToolCalls: number;
    a2aMessages: number;
  };
  database: {
    queries: number;
    averageQueryTime: number;
    connections: number;
    cacheHitRate: number;
  };
}

export interface MetricAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: Date;
}

interface MetricsCollectorProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onAlert?: (alert: MetricAlert) => void;
}

export const MetricsCollector: React.FC<MetricsCollectorProps> = ({
  autoRefresh = true,
  refreshInterval = 30000,
  onAlert
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<MetricAlert[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);

  // Simulate metrics collection (replace with actual API calls)
  const collectMetrics = useCallback(async (): Promise<SystemMetrics> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const now = new Date();
    const baseMetrics = {
      timestamp: now,
      performance: {
        responseTime: Math.random() * 500 + 100,
        throughput: Math.random() * 1000 + 500,
        errorRate: Math.random() * 5,
        cpuUsage: Math.random() * 80 + 10,
        memoryUsage: Math.random() * 70 + 20
      },
      usage: {
        activeUsers: Math.floor(Math.random() * 50 + 10),
        totalRequests: Math.floor(Math.random() * 10000 + 5000),
        successfulRequests: 0,
        failedRequests: 0
      },
      ai: {
        agentExecutions: Math.floor(Math.random() * 100 + 50),
        averageAgentTime: Math.random() * 3000 + 1000,
        ragQueries: Math.floor(Math.random() * 200 + 100),
        mcpToolCalls: Math.floor(Math.random() * 300 + 150),
        a2aMessages: Math.floor(Math.random() * 500 + 250)
      },
      database: {
        queries: Math.floor(Math.random() * 1000 + 500),
        averageQueryTime: Math.random() * 100 + 10,
        connections: Math.floor(Math.random() * 20 + 5),
        cacheHitRate: Math.random() * 30 + 70
      }
    };

    // Calculate derived metrics
    baseMetrics.usage.successfulRequests = 
      Math.floor(baseMetrics.usage.totalRequests * (1 - baseMetrics.performance.errorRate / 100));
    baseMetrics.usage.failedRequests = 
      baseMetrics.usage.totalRequests - baseMetrics.usage.successfulRequests;

    return baseMetrics;
  }, []);

  const checkThresholds = useCallback((metric: SystemMetrics) => {
    const newAlerts: MetricAlert[] = [];

    // Performance thresholds
    if (metric.performance.responseTime > 1000) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'warning',
        metric: 'Response Time',
        threshold: 1000,
        currentValue: metric.performance.responseTime,
        message: 'Response time is above 1000ms',
        timestamp: new Date()
      });
    }

    if (metric.performance.errorRate > 5) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'error',
        metric: 'Error Rate',
        threshold: 5,
        currentValue: metric.performance.errorRate,
        message: 'Error rate is above 5%',
        timestamp: new Date()
      });
    }

    if (metric.performance.cpuUsage > 80) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'warning',
        metric: 'CPU Usage',
        threshold: 80,
        currentValue: metric.performance.cpuUsage,
        message: 'CPU usage is above 80%',
        timestamp: new Date()
      });
    }

    if (metric.performance.memoryUsage > 85) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'error',
        metric: 'Memory Usage',
        threshold: 85,
        currentValue: metric.performance.memoryUsage,
        message: 'Memory usage is above 85%',
        timestamp: new Date()
      });
    }

    // Database thresholds
    if (metric.database.averageQueryTime > 50) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'warning',
        metric: 'Database Query Time',
        threshold: 50,
        currentValue: metric.database.averageQueryTime,
        message: 'Average database query time is above 50ms',
        timestamp: new Date()
      });
    }

    if (metric.database.cacheHitRate < 80) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: 'warning',
        metric: 'Cache Hit Rate',
        threshold: 80,
        currentValue: metric.database.cacheHitRate,
        message: 'Cache hit rate is below 80%',
        timestamp: new Date()
      });
    }

    setAlerts(prev => [...prev.slice(-4), ...newAlerts].slice(-10));
    
    newAlerts.forEach(alert => {
      if (onAlert) onAlert(alert);
    });
  }, [onAlert]);

  const refreshMetrics = useCallback(async () => {
    if (isCollecting) return;
    
    setIsCollecting(true);
    try {
      const newMetrics = await collectMetrics();
      setCurrentMetrics(newMetrics);
      setMetrics(prev => [...prev.slice(-59), newMetrics]);
      checkThresholds(newMetrics);
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    } finally {
      setIsCollecting(false);
    }
  }, [collectMetrics, checkThresholds, isCollecting]);

  useEffect(() => {
    // Initial collection
    refreshMetrics();

    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshMetrics]);

  const formatValue = (value: number, unit: string = '', decimals: number = 0): string => {
    return `${value.toFixed(decimals)}${unit}`;
  };

  const getHealthStatus = (): { status: 'healthy' | 'warning' | 'critical', color: string } => {
    if (!currentMetrics) return { status: 'healthy', color: 'text-gray-500' };

    const criticalIssues = alerts.filter(a => a.type === 'error').length;
    const warnings = alerts.filter(a => a.type === 'warning').length;

    if (criticalIssues > 0) return { status: 'critical', color: 'text-red-500' };
    if (warnings > 0) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'healthy', color: 'text-green-500' };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">System Metrics</h2>
            <p className="text-sm text-gray-600">Real-time monitoring and analytics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={health.color}>
            <CheckCircle className="h-3 w-3 mr-1" />
            {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </Badge>
          <Button 
            variant="outline" 
            onClick={refreshMetrics} 
            disabled={isCollecting}
          >
            {isCollecting ? 'Collecting...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(currentMetrics.performance.responseTime, 'ms')}
              </div>
              <Progress 
                value={(currentMetrics.performance.responseTime / 2000) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMetrics.usage.activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatValue(currentMetrics.usage.totalRequests)} total requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(currentMetrics.performance.cpuUsage, '%', 1)}
              </div>
              <Progress 
                value={currentMetrics.performance.cpuUsage} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(currentMetrics.performance.errorRate, '%', 2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentMetrics.usage.failedRequests} failed requests
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ai">AI Systems</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Core system metrics and utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentMetrics && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU Usage</span>
                      <span className="font-mono">
                        {formatValue(currentMetrics.performance.cpuUsage, '%', 1)}
                      </span>
                    </div>
                    <Progress value={currentMetrics.performance.cpuUsage} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <span className="font-mono">
                        {formatValue(currentMetrics.performance.memoryUsage, '%', 1)}
                      </span>
                    </div>
                    <Progress value={currentMetrics.performance.memoryUsage} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Throughput</span>
                      <span className="font-mono">
                        {formatValue(currentMetrics.performance.throughput, ' req/min')}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Statistics</CardTitle>
                <CardDescription>HTTP request metrics and success rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentMetrics && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Requests</span>
                      <span className="font-mono">
                        {formatValue(currentMetrics.usage.totalRequests)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Successful</span>
                      <span className="font-mono text-green-600">
                        {formatValue(currentMetrics.usage.successfulRequests)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Failed</span>
                      <span className="font-mono text-red-600">
                        {formatValue(currentMetrics.usage.failedRequests)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-mono">
                        {formatValue(
                          (currentMetrics.usage.successfulRequests / currentMetrics.usage.totalRequests) * 100,
                          '%',
                          1
                        )}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI System Metrics</CardTitle>
              <CardDescription>Agent executions, RAG queries, and AI processing statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {currentMetrics && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentMetrics.ai.agentExecutions}
                    </div>
                    <div className="text-sm text-gray-600">Agent Executions</div>
                    <div className="text-xs text-gray-500">
                      Avg: {formatValue(currentMetrics.ai.averageAgentTime, 'ms')}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentMetrics.ai.ragQueries}
                    </div>
                    <div className="text-sm text-gray-600">RAG Queries</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentMetrics.ai.mcpToolCalls}
                    </div>
                    <div className="text-sm text-gray-600">MCP Tool Calls</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {currentMetrics.ai.a2aMessages}
                    </div>
                    <div className="text-sm text-gray-600">A2A Messages</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>Query performance and connection statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {currentMetrics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {currentMetrics.database.queries}
                    </div>
                    <div className="text-sm text-gray-600">Total Queries</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatValue(currentMetrics.database.averageQueryTime, 'ms', 1)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Query Time</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {currentMetrics.database.connections}
                    </div>
                    <div className="text-sm text-gray-600">Active Connections</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatValue(currentMetrics.database.cacheHitRate, '%', 1)}
                    </div>
                    <div className="text-sm text-gray-600">Cache Hit Rate</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent warnings and critical issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Active Alerts
                    </h3>
                    <p className="text-gray-500">All systems are operating normally</p>
                  </div>
                ) : (
                  alerts.map(alert => {
                    const Icon = alert.type === 'error' ? XCircle : AlertTriangle;
                    const color = alert.type === 'error' ? 'text-red-500' : 'text-yellow-500';
                    
                    return (
                      <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Icon className={`h-5 w-5 ${color} mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{alert.metric}</h4>
                            <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                              {alert.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsCollector;