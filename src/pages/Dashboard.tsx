import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Brain, 
  Database, 
  Network, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { systemIntegrationService } from "@/services/integration/systemIntegrationService";
import { ragService } from "@/services/rag/ragService";
import { a2aService } from "@/services/a2a/a2aService";
import { mcpService } from "@/services/mcp/mcpService";
import { deepseekReasonerService } from "@/services/deepseek/deepseekReasonerService";

const Dashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    setLoading(true);
    try {
      // Check if system is initialized
      if (!systemIntegrationService.isInitialized) {
        await systemIntegrationService.initialize();
      }

      const health = await systemIntegrationService.getSystemHealth();
      setSystemHealth(health);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load system health:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshHealth = () => {
    loadSystemHealth();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">System Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor all AI services and system integrations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <Button onClick={refreshHealth} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading system health...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">System Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor all AI services and system integrations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button onClick={refreshHealth} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemHealth && Object.entries(systemHealth).map(([service, health]: [string, any]) => (
            <Card key={service}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {service === 'rag' && <Database className="h-4 w-4" />}
                  {service === 'a2a' && <Network className="h-4 w-4" />}
                  {service === 'mcp' && <Settings className="h-4 w-4" />}
                  {service === 'deepseek' && <Brain className="h-4 w-4" />}
                  {service.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {health.healthy ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={health.healthy ? "default" : "destructive"}>
                      {health.healthy ? "Healthy" : "Error"}
                    </Badge>
                  </div>
                  {health.error && (
                    <p className="text-xs text-red-500">{health.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
