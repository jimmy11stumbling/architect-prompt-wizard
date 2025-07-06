import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Plus, Save, TestTube } from "lucide-react";
import { workflowEngine } from "@/services/workflow/workflowEngine";
import { WorkflowDefinition } from "@/types/workflow-types";
import { useToast } from "@/hooks/use-toast";
import WorkflowExecutionMonitor from "./WorkflowExecutionMonitor";

const WorkflowExecutionTest: React.FC = () => {
  const [testWorkflow, setTestWorkflow] = useState<WorkflowDefinition>({
    id: `test_${Date.now()}`,
    name: "Test Multi-System Workflow",
    description: "Test workflow integrating RAG, A2A, MCP, and DeepSeek",
    version: "1.0.0",
    author: "System",
    tags: ["test", "integration"],
    steps: [
      {
        id: "step1",
        name: "RAG Query",
        type: "rag-query",
        description: "Query knowledge base for platform information",
        config: {
          query: "What are the features of Cursor IDE?",
          limit: 5,
          threshold: 0.3
        }
      },
      {
        id: "step2", 
        name: "A2A Coordination",
        type: "a2a-coordinate",
        description: "Coordinate with agents for analysis",
        config: {
          task: "analyze_platform_features",
          capabilities: ["analysis", "documentation"]
        }
      },
      {
        id: "step3",
        name: "MCP Tool Call",
        type: "mcp-tool",
        description: "Use MCP tool for file operations",
        config: {
          toolName: "list_files", 
          parameters: { path: "/workspace" }
        }
      },
      {
        id: "step4",
        name: "DeepSeek Reasoning",
        type: "deepseek-reason",
        description: "Generate comprehensive analysis",
        config: {
          prompt: "Based on the RAG data and agent analysis, provide insights on ${step1.result}",
          maxTokens: 1000,
          ragEnabled: true,
          a2aEnabled: true,
          mcpEnabled: true
        }
      },
      {
        id: "step5",
        name: "Data Transform",
        type: "data-transform",
        description: "Transform and format results",
        config: {
          operation: "map",
          sourceStepId: "step4",
          mapping: {
            summary: "content",
            timestamp: "created_at",
            source: "model"
          }
        }
      }
    ],
    variables: [
      { name: "platform", type: "string", defaultValue: "cursor" },
      { name: "outputFormat", type: "string", defaultValue: "detailed" }
    ],
    triggers: ["manual"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "draft"
  });
  
  const [executionVariables, setExecutionVariables] = useState<Record<string, any>>({
    platform: "cursor",
    outputFormat: "detailed",
    userQuery: "Analyze Cursor IDE features"
  });
  
  const [currentExecution, setCurrentExecution] = useState<string | null>(null);
  const { toast } = useToast();

  const registerTestWorkflow = () => {
    workflowEngine.registerWorkflow(testWorkflow);
    toast({
      title: "Workflow Registered",
      description: `Test workflow "${testWorkflow.name}" has been registered`
    });
  };

  const executeTestWorkflow = async () => {
    try {
      registerTestWorkflow();
      
      // Generate a unique execution ID for this test
      const executionId = `test_exec_${Date.now()}`;
      setCurrentExecution(executionId);
      
      // Start the workflow execution
      const execution = await workflowEngine.executeWorkflow(testWorkflow.id, executionVariables);
      
      toast({
        title: "Workflow Started",
        description: `Test execution ${executionId} has been started`,
        variant: "default"
      });
      
      // Log the execution details
      console.log("Test workflow execution started:", {
        workflowId: testWorkflow.id,
        executionId,
        variables: executionVariables,
        execution
      });
    } catch (error) {
      console.error("Failed to execute workflow:", error);
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const addCustomStep = () => {
    const newStep = {
      id: `step${testWorkflow.steps.length + 1}`,
      name: "Custom Step",
      type: "http-request" as const,
      description: "Custom HTTP request step",
      config: {
        url: "https://api.example.com/data",
        method: "GET",
        headers: {},
        parseResponse: true
      }
    };
    
    setTestWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStepConfig = (stepId: string, config: any) => {
    setTestWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, config: { ...step.config, ...config } } : step
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Test Workflow Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Workflow Execution Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Workflow Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={testWorkflow.name}
                onChange={(e) => setTestWorkflow(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-desc">Description</Label>
              <Textarea
                id="workflow-desc"
                value={testWorkflow.description}
                onChange={(e) => setTestWorkflow(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Execution Variables */}
          <div className="space-y-3">
            <Label>Execution Variables</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={executionVariables.platform} 
                  onValueChange={(value) => setExecutionVariables(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cursor">Cursor</SelectItem>
                    <SelectItem value="bolt">Bolt</SelectItem>
                    <SelectItem value="replit">Replit</SelectItem>
                    <SelectItem value="windsurf">Windsurf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="format">Output Format</Label>
                <Select 
                  value={executionVariables.outputFormat} 
                  onValueChange={(value) => setExecutionVariables(prev => ({ ...prev, outputFormat: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="query">User Query</Label>
                <Input
                  id="query"
                  value={executionVariables.userQuery}
                  onChange={(e) => setExecutionVariables(prev => ({ ...prev, userQuery: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Workflow Steps ({testWorkflow.steps.length})</Label>
              <Button onClick={addCustomStep} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testWorkflow.steps.map((step, index) => (
                <div key={step.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{step.name}</span>
                      <Badge variant="secondary">{step.type}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button onClick={registerTestWorkflow} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Register Workflow
            </Button>
            <Button onClick={executeTestWorkflow} variant="default">
              <Play className="h-4 w-4 mr-2" />
              Execute Test Workflow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Execution Monitor */}
      {currentExecution && (
        <Card>
          <CardHeader>
            <CardTitle>Live Execution Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowExecutionMonitor executionId={currentExecution} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowExecutionTest;