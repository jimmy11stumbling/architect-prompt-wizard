
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workflow, Zap, Settings, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { ragService } from "@/services/rag/ragService";
import { a2aService } from "@/services/a2a/a2aService";
import { mcpService } from "@/services/mcp/mcpService";
import { AgentName } from "@/types/ipa-types";

interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
  duration?: number;
  result?: any;
}

const IntegratedWorkflow: React.FC = () => {
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [realTimeLog, setRealTimeLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setRealTimeLog(prev => [...prev.slice(-9), logEntry]);
    console.log("Workflow:", logEntry);
  };

  const initializeWorkflow = () => {
    const steps: WorkflowStep[] = [
      { id: "init", name: "Initialize Services", status: "pending" },
      { id: "rag", name: "RAG Knowledge Query", status: "pending" },
      { id: "a2a", name: "Agent Communication", status: "pending" },
      { id: "mcp", name: "Tool Execution", status: "pending" },
      { id: "integration", name: "Cross-Service Integration", status: "pending" },
      { id: "finalize", name: "Workflow Completion", status: "pending" }
    ];
    
    setWorkflow(steps);
    setProgress(0);
    setRealTimeLog([]);
  };

  const updateStepStatus = (stepId: string, status: WorkflowStep["status"], result?: any) => {
    setWorkflow(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, duration: Date.now() }
        : step
    ));
  };

  const runIntegratedWorkflow = async () => {
    setIsRunning(true);
    setCurrentStep(null);
    initializeWorkflow();
    
    try {
      addToLog("🚀 Starting integrated workflow demonstration");
      
      // Step 1: Initialize Services
      setCurrentStep("init");
      updateStepStatus("init", "running");
      addToLog("🔧 Initializing all services...");
      
      await ragService.initialize();
      await a2aService.initialize();
      await mcpService.initialize();
      
      updateStepStatus("init", "completed", { services: ["RAG", "A2A", "MCP"] });
      setProgress(16);
      addToLog("✅ All services initialized successfully");

      // Step 2: RAG Knowledge Query
      setCurrentStep("rag");
      updateStepStatus("rag", "running");
      addToLog("📚 Executing RAG knowledge query...");
      
      const ragResult = await ragService.query({
        query: "integrated workflow demonstration",
        limit: 3
      });
      
      updateStepStatus("rag", "completed", ragResult);
      setProgress(33);
      addToLog(`✅ RAG query completed - found ${ragResult.documents.length} documents`);

      // Step 3: Agent Communication
      setCurrentStep("a2a");
      updateStepStatus("a2a", "running");
      addToLog("🤖 Coordinating with A2A agents...");
      
      const delegation = await a2aService.delegateTask(
        "Integrated workflow coordination",
        ["workflow-coordination", "task-management"]
      );
      
      updateStepStatus("a2a", "completed", delegation);
      setProgress(50);
      addToLog(`✅ A2A coordination completed - task: ${delegation.taskId}`);

      // Step 4: Tool Execution
      setCurrentStep("mcp");
      updateStepStatus("mcp", "running");
      addToLog("🔧 Executing MCP tools...");
      
      const toolResult = await mcpService.callTool("read_file", {
        path: "/project/README.md"
      });
      
      updateStepStatus("mcp", "completed", toolResult);
      setProgress(66);
      addToLog("✅ MCP tool execution completed");

      // Step 5: Cross-Service Integration
      setCurrentStep("integration");
      updateStepStatus("integration", "running");
      addToLog("🔗 Demonstrating cross-service integration...");
      
      // Simulate complex integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const integrationResult = {
        ragDocuments: ragResult.documents.length,
        a2aTaskId: delegation.taskId,
        mcpToolResult: toolResult.status,
        timestamp: new Date().toISOString()
      };
      
      updateStepStatus("integration", "completed", integrationResult);
      setProgress(83);
      addToLog("✅ Cross-service integration demonstrated");

      // Step 6: Finalize
      setCurrentStep("finalize");
      updateStepStatus("finalize", "running");
      addToLog("🎯 Finalizing workflow...");
      
      const finalResult = {
        workflowId: `workflow-${Date.now()}`,
        totalSteps: workflow.length,
        completedSteps: workflow.length,
        success: true
      };
      
      updateStepStatus("finalize", "completed", finalResult);
      setProgress(100);
      addToLog("🎉 Integrated workflow completed successfully!");
      
    } catch (error) {
      const currentStepId = currentStep || "unknown";
      updateStepStatus(currentStepId, "error", { error: error instanceof Error ? error.message : "Unknown error" });
      addToLog(`❌ Workflow failed at step ${currentStepId}: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRunning(false);
      setCurrentStep(null);
    }
  };

  const getStepIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "running": return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStepColor = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "error": return "bg-red-100 text-red-800";
      case "running": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Integrated System Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              onClick={runIntegratedWorkflow}
              disabled={isRunning}
              size="lg"
            >
              {isRunning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Running Workflow..." : "Start Integrated Workflow"}
            </Button>
            
            {isRunning && (
              <div className="text-sm text-muted-foreground">
                Progress: {progress}%
              </div>
            )}
          </div>

          {isRunning && (
            <Progress value={progress} className="w-full" />
          )}

          <Tabs defaultValue="steps" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="steps">Workflow Steps</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="logs">Real-time Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="steps">
              <div className="space-y-3">
                {workflow.map((step, index) => (
                  <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        {getStepIcon(step.status)}
                      </div>
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <Badge className={getStepColor(step.status)}>
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results">
              <div className="space-y-4">
                {workflow.filter(step => step.result).map((step) => (
                  <Card key={step.id}>
                    <CardHeader>
                      <CardTitle className="text-sm">{step.name} Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(step.result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
                
                {workflow.filter(step => step.result).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No results yet. Run the workflow to see step results.</p>
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
                    {realTimeLog.length > 0 ? (
                      realTimeLog.map((log, index) => (
                        <div key={index} className="text-muted-foreground">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No activity logs yet. Start the workflow to see real-time updates.
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

export default IntegratedWorkflow;
