
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cpu, Database, Network, Settings, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { systemIntegrationService, SystemHealth } from "@/services/integration/systemIntegrationService";

const SystemHealthDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      const health = await systemIntegrationService.getSystemHealth();
      setSystemHealth(health);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to check system health:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            System Health Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            System Health Dashboard
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={systemHealth?.overallStatus === "operational" ? "default" : "destructive"}>
              {systemHealth?.overallStatus}
            </Badge>
            <Button variant="outline" size="sm" onClick={checkSystemHealth}>
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {systemHealth?.overallStatus === "critical" && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              System is experiencing critical issues. Some services may be unavailable.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {getStatusIcon(systemHealth?.ragService || "offline")}
            </div>
            <span className="font-medium">RAG Service</span>
            <Badge className={getStatusColor(systemHealth?.ragService || "offline")}>
              {systemHealth?.ragService}
            </Badge>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              {getStatusIcon(systemHealth?.a2aService || "offline")}
            </div>
            <span className="font-medium">A2A Service</span>
            <Badge className={getStatusColor(systemHealth?.a2aService || "offline")}>
              {systemHealth?.a2aService}
            </Badge>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {getStatusIcon(systemHealth?.mcpService || "offline")}
            </div>
            <span className="font-medium">MCP Service</span>
            <Badge className={getStatusColor(systemHealth?.mcpService || "offline")}>
              {systemHealth?.mcpService}
            </Badge>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              {getStatusIcon(systemHealth?.deepseekAPI || "offline")}
            </div>
            <span className="font-medium">DeepSeek API</span>
            <Badge className={getStatusColor(systemHealth?.deepseekAPI || "offline")}>
              {systemHealth?.deepseekAPI}
            </Badge>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall System Health</span>
              <span>
                {systemHealth?.overallStatus === "operational" ? "100%" : 
                 systemHealth?.overallStatus === "degraded" ? "75%" : "25%"}
              </span>
            </div>
            <Progress 
              value={systemHealth?.overallStatus === "operational" ? 100 : 
                     systemHealth?.overallStatus === "degraded" ? 75 : 25} 
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthDashboard;
