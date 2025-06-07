
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Database, Network, Wrench, Brain, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { systemIntegrationService, SystemHealth } from "@/services/integration/systemIntegrationService";
import { useToast } from "@/hooks/use-toast";

const SystemHealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const healthData = await systemIntegrationService.getSystemHealth();
      setHealth(healthData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch system health:", error);
      toast({
        title: "Health Check Failed",
        description: "Unable to retrieve system health status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runDemo = async () => {
    setIsLoading(true);
    try {
      await systemIntegrationService.demonstrateIntegration();
      toast({
        title: "Demo Complete",
        description: "Integration demonstration completed successfully"
      });
      await fetchHealth();
    } catch (error) {
      console.error("Demo failed:", error);
      toast({
        title: "Demo Failed",
        description: "Integration demonstration failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "Online" : "Offline"}
      </Badge>
    );
  };

  if (!health) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Activity className="h-6 w-6 animate-spin mr-2" />
          <span>Loading system health...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={health.overall ? "default" : "destructive"}>
              {health.overallStatus.toUpperCase()}
            </Badge>
            <Button
              onClick={fetchHealth}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!health.overall && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                One or more services are experiencing issues. Check individual service status below.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <span className="font-medium">DeepSeek</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.services.deepseek)}
                {getStatusBadge(health.services.deepseek)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="font-medium">RAG 2.0</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.services.rag)}
                {getStatusBadge(health.services.rag)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-green-500" />
                <span className="font-medium">A2A Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.services.a2a)}
                {getStatusBadge(health.services.a2a)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-500" />
                <span className="font-medium">MCP Hub</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.services.mcp)}
                {getStatusBadge(health.services.mcp)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="integration">Integration Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">RAG Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Documents:</span>
                    <span className="font-medium">{health.details.ragDocuments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Vector DB:</span>
                    <span className="font-medium">Chroma</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">A2A Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Agents:</span>
                    <span className="font-medium">{health.details.a2aAgents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Protocol:</span>
                    <span className="font-medium">A2A v1.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">MCP Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Servers:</span>
                    <span className="font-medium">{health.details.mcpServers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tools:</span>
                    <span className="font-medium">Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integration Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Test the complete integration between DeepSeek Reasoner, RAG 2.0, A2A Protocol, and MCP Hub.
              </p>
              <Button 
                onClick={runDemo} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Running Integration Test...
                  </>
                ) : (
                  "Run Full Integration Test"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <span>System uptime: {Math.round((Date.now() - health.lastCheck) / 1000)}s ago</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
