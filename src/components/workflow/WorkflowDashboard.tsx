
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap,
  Database,
  Cpu,
  MemoryStick,
  Wifi
} from "lucide-react";
import { workflowMonitoringService, SystemMetrics, WorkflowAlert } from "@/services/workflow/workflowMonitoringService";
import { workflowPersistenceService, WorkflowRecord } from "@/services/workflow/workflowPersistenceService";
import { workflowEngine } from "@/services/workflow/workflowEngine";

const WorkflowDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [systemMetrics, activeAlerts, savedWorkflows, recentExecutions] = await Promise.all([
          workflowMonitoringService.getSystemMetrics(),
          workflowMonitoringService.getAlerts(),
          workflowPersistenceService.getWorkflows(),
          workflowPersistenceService.getExecutions()
        ]);

        setMetrics(systemMetrics);
        setAlerts(activeAlerts);
        setWorkflows(savedWorkflows);
        setExecutions(recentExecutions.slice(0, 10)); // Last 10 executions
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const executeWorkflow = async (workflowId: string) => {
    try {
      await workflowEngine.executeWorkflow(workflowId, {});
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    }
  };

  const resolveAlert = (alertId: string) => {
    workflowMonitoringService.resolveAlert(alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "running": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "timeout": return <Clock className="h-4 w-4 text-orange-500" />;
      case "resource": return <Cpu className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeWorkflows}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completedToday}</div>
              <p className="text-xs text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.failedToday}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.averageExecutionTime / 1000)}s</div>
              <p className="text-xs text-muted-foreground">Average duration</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Usage */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    CPU Usage
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(metrics.resourceUsage.cpu * 100)}%
                  </span>
                </div>
                <Progress value={metrics.resourceUsage.cpu * 100} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <MemoryStick className="h-4 w-4" />
                    Memory Usage
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(metrics.resourceUsage.memory * 100)}%
                  </span>
                </div>
                <Progress value={metrics.resourceUsage.memory * 100} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Network Usage
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(metrics.resourceUsage.network * 100)}%
                  </span>
                </div>
                <Progress value={metrics.resourceUsage.network * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Saved Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {workflow.definition.steps?.length || 0} steps • Created {new Date(workflow.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button 
                      onClick={() => executeWorkflow(workflow.id)}
                      size="sm"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Execute
                    </Button>
                  </div>
                ))}
                {workflows.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No workflows created yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Execution {execution.id.slice(-8)}</div>
                      <div className="text-sm text-muted-foreground">
                        Started: {new Date(execution.started_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                ))}
                {executions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No executions yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => resolveAlert(alert.id)}
                      variant="outline"
                      size="sm"
                    >
                      Resolve
                    </Button>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active alerts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowDashboard;
