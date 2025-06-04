
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LayoutDashboard, Database, Network, Settings, Activity, AlertTriangle } from "lucide-react";
import SystemHealthDashboard from "@/components/system-integration/SystemHealthDashboard";
import RAGQueryInterface from "@/components/rag/RAGQueryInterface";
import A2ANetworkViewer from "@/components/a2a/A2ANetworkViewer";
import MCPHubInterface from "@/components/mcp/MCPHubInterface";
import { systemIntegrationService } from "@/services/integration/systemIntegrationService";
import { ProjectSpec } from "@/types/ipa-types";

const Dashboard: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      if (systemIntegrationService.isInitialized()) {
        setIsInitialized(true);
        return;
      }

      const demoSpec: ProjectSpec = {
        projectDescription: "IPA System Dashboard",
        frontendTechStack: ["React"],
        backendTechStack: ["Express"],
        customFrontendTech: [],
        customBackendTech: [],
        a2aIntegrationDetails: "Multi-agent communication system",
        additionalFeatures: "RAG 2.0 integration with MCP protocol",
        ragVectorDb: "Chroma",
        customRagVectorDb: "",
        mcpType: "Standard MCP",
        customMcpType: "",
        advancedPromptDetails: "DeepSeek Reasoner integration"
      };

      await systemIntegrationService.initialize(demoSpec);
      setIsInitialized(true);
    } catch (error) {
      console.error("System initialization failed:", error);
      setInitializationError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System initialization failed: {initializationError}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={initializeSystem}
            >
              Retry Initialization
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-spin" />
              Initializing System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Setting up RAG 2.0, A2A, and MCP services...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gradient">System Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Monitor and control your integrated AI system with RAG 2.0, A2A, and MCP
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              RAG Query
            </TabsTrigger>
            <TabsTrigger value="a2a" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              A2A Network
            </TabsTrigger>
            <TabsTrigger value="mcp" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              MCP Hub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemHealthDashboard />
          </TabsContent>

          <TabsContent value="rag" className="space-y-6">
            <RAGQueryInterface />
          </TabsContent>

          <TabsContent value="a2a" className="space-y-6">
            <A2ANetworkViewer />
          </TabsContent>

          <TabsContent value="mcp" className="space-y-6">
            <MCPHubInterface />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
