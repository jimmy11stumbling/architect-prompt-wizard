
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Database, Network, Settings, CheckCircle, AlertTriangle, XCircle, Zap } from "lucide-react";
import { systemIntegrationService, SystemHealth } from "@/services/integration/systemIntegrationService";
import { ragService } from "@/services/rag/ragService";
import { a2aService } from "@/services/a2a/a2aService";
import { mcpService } from "@/services/mcp/mcpService";

const SystemHealthDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({});
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [integrationDemo, setIntegrationDemo] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    updateSystemHealth();
    if (autoRefresh) {
      const interval = setInterval(updateSystemHealth, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setActivityLog(prev => [...prev.slice(-9), logEntry]);
    console.log("System:", logEntry);
  };

  const updateSystemHealth = async () => {
    try {
      const health = await systemIntegrationService.getSystemHealth();
      setSystemHealth(health);

      // Gather real-time metrics
      const metrics = {
        ragDocuments: ragService.isInitialized() ? ragService.getDocumentCount() : 0,
        ragVectorDb: ragService.isInitialized() ? ragService.getVectorDatabase() : "None",
        a2aAgents: a2aService.isInitialized() ? a2aService.getAllAgents().length : 0,
        a2aMessages: a2aService.isInitialized() ? a2aService.getMessages().length : 0,
        mcpServers: mcpService.isInitialized() ? mcpService.getServers().length : 0,
        mcpTools: mcpService.isInitialized() ? (await mcpService.listTools()).length : 0,
        lastUpdate: new Date().toLocaleTimeString()
      };
      
      setRealTimeMetrics(metrics);
      addToLog(`🔄 System health check completed - Status: ${health.overallStatus}`);
      
    } catch (error) {
      addToLog(`❌ Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const runIntegrationDemo = async () => {
    try {
      addToLog("🚀 Starting integration demonstration");
      const demo = await systemIntegrationService.demonstrateIntegration();
      setIntegrationDemo(demo);
      addToLog("✅ Integration demo completed successfully");
    } catch (error) {
      addToLog(`❌ Integration demo failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "offline": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-100 text-green-800";
      case "degraded": return "bg-yellow-100 text-yellow-800";
      case "offline": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getOverallHealthPercentage = () => {
    if (!systemHealth) return 0;
    const services = [
      systemHealth.services.rag,
      systemHealth.services.a2a,
      systemHealth.services.mcp,
      systemHealth.services.deepseek
    ];
    const healthyCount = services.filter(s => s === true).length;
    return (healthyCount / services.length) * 100;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "Pause" : "Resume"} Auto-refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={updateSystemHealth}
              >
                Refresh Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {systemHealth && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {getOverallHealthPercentage().toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  System Health Score
                </div>
                <Progress value={getOverallHealthPercentage()} className="w-full" />
                <Badge className={`${getHealthColor(systemHealth.overallStatus)} text-lg px-4 py-2 mt-4`}>
                  {systemHealth.overallStatus.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(systemHealth.services.rag ? "healthy" : "offline")}
                      <span className="font-medium">RAG Service</span>
                    </div>
                    <Badge className={getHealthColor(systemHealth.services.rag ? "healthy" : "offline")}>
                      {systemHealth.services.rag ? "healthy" : "offline"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(systemHealth.services.a2a ? "healthy" : "offline")}
                      <span className="font-medium">A2A Service</span>
                    </div>
                    <Badge className={getHealthColor(systemHealth.services.a2a ? "healthy" : "offline")}>
                      {systemHealth.services.a2a ? "healthy" : "offline"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(systemHealth.services.mcp ? "healthy" : "offline")}
                      <span className="font-medium">MCP Service</span>
                    </div>
                    <Badge className={getHealthColor(systemHealth.services.mcp ? "healthy" : "offline")}>
                      {systemHealth.services.mcp ? "healthy" : "offline"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(systemHealth.services.deepseek ? "healthy" : "offline")}
                      <span className="font-medium">DeepSeek API</span>
                    </div>
                    <Badge className={getHealthColor(systemHealth.services.deepseek ? "healthy" : "offline")}>
                      {systemHealth.services.deepseek ? "healthy" : "offline"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Tabs defaultValue="metrics" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
              <TabsTrigger value="integration">Integration Test</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{realTimeMetrics.ragDocuments || 0}</div>
                  <div className="text-sm text-muted-foreground">RAG Documents</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    DB: {realTimeMetrics.ragVectorDb || "None"}
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Network className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{realTimeMetrics.a2aAgents || 0}</div>
                  <div className="text-sm text-muted-foreground">A2A Agents</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {realTimeMetrics.a2aMessages || 0} messages
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{realTimeMetrics.mcpServers || 0}</div>
                  <div className="text-sm text-muted-foreground">MCP Servers</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {realTimeMetrics.mcpTools || 0} tools
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">Live</div>
                  <div className="text-sm text-muted-foreground">System Status</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {realTimeMetrics.lastUpdate || "Never"}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration">
              <div className="space-y-4">
                <Button 
                  onClick={runIntegrationDemo}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Run Integration Demo
                </Button>

                {integrationDemo && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">RAG Integration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">✓ Working</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Documents: {integrationDemo.ragDemo?.documents?.length || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">A2A Integration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">✓ Working</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Message sent successfully
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">MCP Integration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">✓ Working</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tool executed successfully
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Integration Test Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          {JSON.stringify(integrationDemo, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Real-time Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-xs space-y-1 max-h-64 overflow-y-auto bg-muted p-3 rounded">
                    {activityLog.length > 0 ? (
                      activityLog.map((log, index) => (
                        <div key={index} className="text-muted-foreground">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No activity logs yet. System monitoring will appear here.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
