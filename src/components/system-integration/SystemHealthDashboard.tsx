import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Database, 
  Network, 
  Settings, 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Server
} from "lucide-react";
import { SystemHealthStatus } from "@/services/integration/types";
import { systemIntegrationService } from "@/services/integration/systemIntegrationService";
import { useToast } from "@/hooks/use-toast";

const SystemHealthDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const checkSystemHealth = async () => {
    setIsLoading(true);
    try {
      const health = await systemIntegrationService.getSystemHealth();
      setSystemHealth(health);
      setLastUpdate(new Date());
      
      if (!health.overallHealth) {
        toast({
          title: "System Health Warning",
          description: "Some services are experiencing issues",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Health check failed:", error);
      toast({
        title: "Health Check Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? "text-green-500" : "text-red-500";
  };

  const serviceDetails = [
    {
      key: "rag" as keyof typeof systemHealth.serviceHealth,
      name: "RAG 2.0 Database",
      icon: Database,
      description: "Vector database and document retrieval",
      metrics: systemHealth?.details?.ragDocuments || 0
    },
    {
      key: "a2a" as keyof typeof systemHealth.serviceHealth,
      name: "A2A Network",
      icon: Network,
      description: "Agent-to-agent communication",
      metrics: systemHealth?.details?.a2aAgents || 0
    },
    {
      key: "mcp" as keyof typeof systemHealth.serviceHealth,
      name: "MCP Hub",
      icon: Settings,
      description: "Model Context Protocol services",
      metrics: systemHealth?.details?.mcpServers || 0
    },
    {
      key: "deepseek" as keyof typeof systemHealth.serviceHealth,
      name: "DeepSeek Reasoner",
      icon: Brain,
      description: "AI reasoning and processing",
      metrics: "Active"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Overview
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                Auto: {autoRefresh ? "ON" : "OFF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={checkSystemHealth}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemHealth ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {systemHealth.overallHealth ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  )}
                  <span className="text-lg font-medium">
                    System Status: 
                    <span className={`ml-2 ${getStatusColor(systemHealth.overallHealth)}`}>
                      {systemHealth.overallHealth ? "HEALTHY" : "UNHEALTHY"}
                    </span>
                  </span>
                </div>
                <Badge variant={systemHealth.overallHealth ? "default" : "destructive"}>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Badge>
              </div>
              
              {!systemHealth.overallHealth && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    One or more services are experiencing issues. Check individual service status below.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                <p className="text-muted-foreground">Loading system status...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Service Status</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemHealth && serviceDetails.map((service) => {
              const ServiceIcon = service.icon;
              const isHealthy = systemHealth.serviceHealth[service.key];
              
              return (
                <Card key={service.key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <ServiceIcon className="h-5 w-5" />
                        {service.name}
                      </div>
                      {getStatusIcon(isHealthy || false)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Status: <span className={isHealthy ? "text-green-500" : "text-red-500"}>
                            {isHealthy ? "Operational" : "Down"}
                          </span>
                        </span>
                        <Badge variant="outline">
                          {typeof service.metrics === "number" 
                            ? `${service.metrics} active`
                            : service.metrics
                          }
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {systemHealth?.details?.ragDocuments || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">RAG Documents</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {systemHealth?.details?.a2aAgents || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Agents</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {systemHealth?.details?.mcpServers || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">MCP Servers</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>42%</span>
                  </div>
                  <Progress value={42} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span>125ms avg</span>
                  </div>
                  <Progress value={25} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Recent System Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[
                  { time: "14:32:15", level: "INFO", service: "RAG", message: "Document index updated successfully" },
                  { time: "14:31:42", level: "INFO", service: "A2A", message: "New agent connected: reasoning-assistant" },
                  { time: "14:30:18", level: "INFO", service: "MCP", message: "Tool registration completed" },
                  { time: "14:29:55", level: "WARN", service: "DeepSeek", message: "Rate limit approaching" },
                  { time: "14:28:33", level: "INFO", service: "System", message: "Health check completed" }
                ].map((log, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 border rounded text-sm">
                    <span className="text-muted-foreground font-mono">{log.time}</span>
                    <Badge 
                      variant={log.level === "WARN" ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {log.level}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{log.service}</Badge>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;
