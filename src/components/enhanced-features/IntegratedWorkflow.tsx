
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workflow, Play, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { systemIntegrationService } from "@/services/integration/systemIntegrationService";
import { ProjectSpec, AgentName } from "@/types/ipa-types";

interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: any;
  error?: string;
}

const IntegratedWorkflow: React.FC = () => {
  const [query, setQuery] = useState("");
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  const executeIntegratedWorkflow = async () => {
    if (!query.trim()) return;

    setIsRunning(true);
    setFinalResult(null);

    const steps: WorkflowStep[] = [
      { id: "rag", name: "RAG Knowledge Retrieval", status: "pending" },
      { id: "a2a", name: "A2A Agent Coordination", status: "pending" },
      { id: "mcp", name: "MCP Tool Integration", status: "pending" },
      { id: "reasoning", name: "DeepSeek Reasoning", status: "pending" },
      { id: "synthesis", name: "Result Synthesis", status: "pending" }
    ];

    setWorkflow(steps);

    try {
      const demoSpec: ProjectSpec = {
        projectDescription: query,
        frontendTechStack: ["React"],
        backendTechStack: ["Express"],
        customFrontendTech: [],
        customBackendTech: [],
        a2aIntegrationDetails: "Integrated workflow processing",
        additionalFeatures: "End-to-end AI processing",
        ragVectorDb: "Chroma",
        customRagVectorDb: "",
        mcpType: "Standard MCP",
        customMcpType: "",
        advancedPromptDetails: "Comprehensive analysis"
      };

      // Step 1: RAG Knowledge Retrieval
      setWorkflow(prev => prev.map(step => 
        step.id === "rag" ? { ...step, status: "running" } : step
      ));

      const ragResult = await new Promise(resolve => {
        setTimeout(() => resolve({ documents: [`Retrieved knowledge for: ${query}`] }), 1000);
      });

      setWorkflow(prev => prev.map(step => 
        step.id === "rag" ? { ...step, status: "completed", result: ragResult } : step
      ));

      // Step 2: A2A Agent Coordination
      setWorkflow(prev => prev.map(step => 
        step.id === "a2a" ? { ...step, status: "running" } : step
      ));

      await new Promise(resolve => setTimeout(resolve, 800));

      setWorkflow(prev => prev.map(step => 
        step.id === "a2a" ? { 
          ...step, 
          status: "completed", 
          result: { coordinatedAgents: ["rag-agent", "mcp-coordinator"] }
        } : step
      ));

      // Step 3: MCP Tool Integration
      setWorkflow(prev => prev.map(step => 
        step.id === "mcp" ? { ...step, status: "running" } : step
      ));

      await new Promise(resolve => setTimeout(resolve, 600));

      setWorkflow(prev => prev.map(step => 
        step.id === "mcp" ? { 
          ...step, 
          status: "completed", 
          result: { toolsUsed: ["document-processor", "semantic-analyzer"] }
        } : step
      ));

      // Step 4: DeepSeek Reasoning
      setWorkflow(prev => prev.map(step => 
        step.id === "reasoning" ? { ...step, status: "running" } : step
      ));

      const enhancedResult = await systemIntegrationService.processEnhancedAgentRequest(
        "RequirementDecompositionAgent" as AgentName,
        demoSpec,
        query
      );

      setWorkflow(prev => prev.map(step => 
        step.id === "reasoning" ? { 
          ...step, 
          status: "completed", 
          result: enhancedResult
        } : step
      ));

      // Step 5: Result Synthesis
      setWorkflow(prev => prev.map(step => 
        step.id === "synthesis" ? { ...step, status: "running" } : step
      ));

      await new Promise(resolve => setTimeout(resolve, 500));

      const synthesizedResult = {
        query,
        ragContext: ragResult,
        enhancedResponse: enhancedResult,
        timestamp: new Date().toISOString(),
        integrationDemo: await systemIntegrationService.demonstrateIntegration()
      };

      setWorkflow(prev => prev.map(step => 
        step.id === "synthesis" ? { 
          ...step, 
          status: "completed", 
          result: synthesizedResult
        } : step
      ));

      setFinalResult(synthesizedResult);

    } catch (error) {
      console.error("Workflow execution failed:", error);
      setWorkflow(prev => prev.map(step => 
        step.status === "running" ? { 
          ...step, 
          status: "failed", 
          error: error instanceof Error ? error.message : "Unknown error"
        } : step
      ));
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "running": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const completedSteps = workflow.filter(step => step.status === "completed").length;
  const progress = workflow.length > 0 ? (completedSteps / workflow.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Integrated AI Workflow Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Enter a complex query that requires RAG knowledge, A2A coordination, MCP tools, and DeepSeek reasoning..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={executeIntegratedWorkflow}
            disabled={isRunning || !query.trim()}
            className="w-full"
          >
            {isRunning ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Execute Integrated Workflow
          </Button>

          {workflow.length > 0 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Workflow Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>

              <div className="space-y-2">
                {workflow.map((step, index) => (
                  <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono text-muted-foreground">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      {getStepIcon(step.status)}
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {finalResult && (
        <Tabs defaultValue="response" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="response">Final Response</TabsTrigger>
            <TabsTrigger value="details">Detailed Results</TabsTrigger>
            <TabsTrigger value="integration">Integration Test</TabsTrigger>
          </TabsList>

          <TabsContent value="response">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced AI Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Generated Response</h4>
                    <div className="bg-muted p-4 rounded">
                      {finalResult.enhancedResponse?.response || "No response generated"}
                    </div>
                  </div>
                  
                  {finalResult.enhancedResponse?.reasoning && (
                    <div>
                      <h4 className="font-medium mb-2">Reasoning Process</h4>
                      <div className="bg-muted p-4 rounded text-sm max-h-48 overflow-y-auto">
                        {finalResult.enhancedResponse.reasoning}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                  {JSON.stringify(finalResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>System Integration Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {finalResult.integrationDemo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">RAG Integration</h4>
                        <Badge variant={finalResult.integrationDemo.integrationTest.ragIntegration ? "default" : "destructive"}>
                          {finalResult.integrationDemo.integrationTest.ragIntegration ? "✓ Working" : "✗ Failed"}
                        </Badge>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">A2A Integration</h4>
                        <Badge variant={finalResult.integrationDemo.integrationTest.a2aIntegration ? "default" : "destructive"}>
                          {finalResult.integrationDemo.integrationTest.a2aIntegration ? "✓ Working" : "✗ Failed"}
                        </Badge>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">MCP Integration</h4>
                        <Badge variant={finalResult.integrationDemo.integrationTest.mcpIntegration ? "default" : "destructive"}>
                          {finalResult.integrationDemo.integrationTest.mcpIntegration ? "✓ Working" : "✗ Failed"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default IntegratedWorkflow;
