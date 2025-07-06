import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Database,
  Server,
  MessageSquare,
  Settings,
  Globe,
  Zap
} from 'lucide-react';

interface SystemStatus {
  component: string;
  status: 'operational' | 'degraded' | 'down';
  message: string;
  lastCheck: Date;
  responseTime?: number;
}

interface HealthMetrics {
  uptime: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
}

const SystemHealthMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkSystemHealth = async () => {
    setIsChecking(true);
    const checks: SystemStatus[] = [];
    const startTime = Date.now();

    try {
      // Check Database Connectivity
      const dbStart = Date.now();
      try {
        const response = await fetch('/api/platforms');
        const dbTime = Date.now() - dbStart;
        checks.push({
          component: 'Database',
          status: response.ok ? 'operational' : 'degraded',
          message: response.ok ? 'PostgreSQL connection healthy' : 'Database connection issues',
          lastCheck: new Date(),
          responseTime: dbTime
        });
      } catch (error) {
        checks.push({
          component: 'Database',
          status: 'down',
          message: 'Database unreachable',
          lastCheck: new Date(),
          responseTime: Date.now() - dbStart
        });
      }

      // Check RAG System
      const ragStart = Date.now();
      try {
        const response = await fetch('/api/rag/stats');
        const ragTime = Date.now() - ragStart;
        if (response.ok) {
          const data = await response.json();
          checks.push({
            component: 'RAG 2.0',
            status: data.documentsIndexed > 0 ? 'operational' : 'degraded',
            message: `${data.documentsIndexed} docs, ${data.chunksIndexed} chunks indexed`,
            lastCheck: new Date(),
            responseTime: ragTime
          });
        } else {
          throw new Error(`RAG API error: ${response.status}`);
        }
      } catch (error) {
        checks.push({
          component: 'RAG 2.0',
          status: 'down',
          message: 'RAG system unreachable',
          lastCheck: new Date(),
          responseTime: Date.now() - ragStart
        });
      }

      // Check MCP System
      const mcpStart = Date.now();
      try {
        const response = await fetch('/api/mcp/tools');
        const mcpTime = Date.now() - mcpStart;
        if (response.ok) {
          const data = await response.json();
          checks.push({
            component: 'MCP Tools',
            status: data.tools?.length > 0 ? 'operational' : 'degraded',
            message: `${data.tools?.length || 0} tools available`,
            lastCheck: new Date(),
            responseTime: mcpTime
          });
        } else {
          throw new Error(`MCP API error: ${response.status}`);
        }
      } catch (error) {
        checks.push({
          component: 'MCP Tools',
          status: 'down',
          message: 'MCP system unreachable',
          lastCheck: new Date(),
          responseTime: Date.now() - mcpStart
        });
      }

      // Check MCP Hub
      const hubStart = Date.now();
      try {
        const response = await fetch('/api/mcp-hub/stats');
        const hubTime = Date.now() - hubStart;
        if (response.ok) {
          const data = await response.json();
          checks.push({
            component: 'MCP Hub',
            status: data.success ? 'operational' : 'degraded',
            message: `${data.data?.totalAssets || 0} attached assets`,
            lastCheck: new Date(),
            responseTime: hubTime
          });
        } else {
          throw new Error(`Hub API error: ${response.status}`);
        }
      } catch (error) {
        checks.push({
          component: 'MCP Hub',
          status: 'down',
          message: 'Hub system unreachable',
          lastCheck: new Date(),
          responseTime: Date.now() - hubStart
        });
      }

      // Check Authentication
      const authStart = Date.now();
      try {
        const response = await fetch('/api/auth/me');
        const authTime = Date.now() - authStart;
        checks.push({
          component: 'Authentication',
          status: response.ok ? 'operational' : 'degraded',
          message: response.ok ? 'Auth system operational' : 'Auth issues detected',
          lastCheck: new Date(),
          responseTime: authTime
        });
      } catch (error) {
        checks.push({
          component: 'Authentication',
          status: 'down',
          message: 'Auth system unreachable',
          lastCheck: new Date(),
          responseTime: Date.now() - authStart
        });
      }

      // Calculate health metrics
      const totalTime = Date.now() - startTime;
      const operationalCount = checks.filter(c => c.status === 'operational').length;
      const avgResponseTime = checks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / checks.length;
      
      setHealthMetrics({
        uptime: (operationalCount / checks.length) * 100,
        totalRequests: checks.length,
        errorRate: ((checks.length - operationalCount) / checks.length) * 100,
        averageResponseTime: Math.round(avgResponseTime)
      });

    } catch (error) {
      console.error('Health check error:', error);
    }

    setSystemStatus(checks);
    setLastUpdate(new Date());
    setIsChecking(false);
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'Database':
        return <Database className="h-4 w-4" />;
      case 'RAG 2.0':
        return <Zap className="h-4 w-4" />;
      case 'MCP Tools':
        return <Settings className="h-4 w-4" />;
      case 'MCP Hub':
        return <Server className="h-4 w-4" />;
      case 'Authentication':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const overallStatus = systemStatus.length > 0 ? 
    systemStatus.every(s => s.status === 'operational') ? 'operational' :
    systemStatus.some(s => s.status === 'down') ? 'down' : 'degraded'
    : 'down';

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              <CardTitle>System Status</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={overallStatus === 'operational' ? 'default' : 'destructive'}
                className={getStatusColor(overallStatus)}
              >
                {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={checkSystemHealth}
                disabled={isChecking}
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {healthMetrics.uptime.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {healthMetrics.averageResponseTime}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {healthMetrics.totalRequests}
                </div>
                <div className="text-sm text-muted-foreground">Services Checked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {healthMetrics.errorRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Error Rate</div>
              </div>
            </div>
          )}

          {/* Component Status Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemStatus.map((status, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getComponentIcon(status.component)}
                    <span className="font-medium text-sm">{status.component}</span>
                  </div>
                  {getStatusIcon(status.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {status.message}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{status.lastCheck.toLocaleTimeString()}</span>
                  {status.responseTime && (
                    <span>{status.responseTime}ms</span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* System Alerts */}
          {systemStatus.some(s => s.status !== 'operational') && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {systemStatus.filter(s => s.status !== 'operational').length} system component(s) 
                require attention. Check individual components for details.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthMonitor;