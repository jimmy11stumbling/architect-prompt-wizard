
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Workflow, 
  Play, 
  Pause, 
  Square, 
  Database, 
  Network, 
  Wrench, 
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap
} from "lucide-react";
import { systemIntegrationService } from "@/services/integration/systemIntegrationService";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  name: string;
  type: "rag" | "a2a" | "mcp" | "deepseek";
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  result?: any;
  error?: string;
}

interface WorkflowExecution {
  id: string;
  name: string;
  query: string;
  steps: WorkflowStep[];
  status: "idle" | "running" | "completed" | "failed";
  startTime?: number;
  endTime?: number;
  overallProgress: number;
}

const IntegratedWorkflow: React.FC = () => {
  const [workflow, setWorkflow] = useState<WorkflowExecution | null>(null);
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowExecution[]>([]);
  const { toast } = useToast();

  const sampleWorkflows = [
    {
      name: "Document Analysis Pipeline",
      query: "Analyze the technical documentation for RAG implementation patterns and provide comprehensive insights",
      description: "Retrieves documents, coordinates with analysis agents, uses tools for validation, and generates detailed analysis"
    },
    {
      name: "System Integration Check",
      query: "Perform a comprehensive health check of all integrated systems and recommend optimizations",
      description: "Queries all services, coordinates diagnostics, executes health tools, and provides system recommendations"
    },
    {
      name: "Knowledge Base Query",
      query: "Find information about MCP protocol implementation and provide implementation guidance",
      description: "Searches knowledge base, engages expert agents, accesses implementation tools, and creates guidance"
    }
  ];

  const executeWorkflow = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a workflow query",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    
    const newWorkflow: WorkflowExecution = {
      id: `workflow-${Date.now()}`,
      name: "Integrated Query Workflow",
      query: query.trim(),
      status: "running",
      startTime: Date.now(),
      overallProgress: 0,
      steps: [
        {
          id: "rag-step",
          name: "RAG Database Query",
          type: "rag",
          status: "running",
          progress: 0
        },
        {
          id: "a2a-step", 
          name: "Agent Coordination",
          type: "a2a",
          status: "pending",
          progress: 0
        },
        {
          id: "mcp-step",
          name: "Tool Execution",
          type: "mcp", 
          status: "pending",
          progress: 0
        },
        {
          id: "deepseek-step",
          name: "DeepSeek Reasoning",
          type: "deepseek",
          status: "pending",
          progress: 0
        }
      ]
    };

    setWorkflow(newWorkflow);

    try {
      // Execute the integrated workflow
      const result = await systemIntegrationService.executeIntegratedQuery(query.trim());
      
      // Simulate progressive execution
      await executeWorkflowSteps(newWorkflow, result);
      
      toast({
        title: "Workflow Completed",
        description: "Integrated workflow executed successfully"
      });
    } catch (error) {
      console.error("Workflow execution failed:", error);
      
      setWorkflow(prev => prev ? {
        ...prev,
        status: "failed",
        endTime: Date.now(),
        steps: prev.steps.map(step => ({
          ...step,
          status: step.status === "running" ? "failed" : step.status,
          error: step.status === "running" ? (error instanceof Error ? error.message : "Unknown error") : step.error
        }))
      } : null);
      
      toast({
        title: "Workflow Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeWorkflowSteps = async (workflow: WorkflowExecution, result: any) => {
    const steps = [...workflow.steps];
    
    // Step 1: RAG Database Query
    await updateStepProgress(0, 100, "completed", result.ragResults);
    
    // Step 2: Agent Coordination
    await updateStepProgress(1, 100, "completed", result.a2aCoordination);
    
    // Step 3: Tool Execution
    await updateStepProgress(2, 100, "completed", result.mcpResults);
    
    // Step 4: DeepSeek Reasoning
    await updateStepProgress(3, 100, "completed", result.reasoning);
    
    // Complete workflow
    setWorkflow(prev => prev ? {
      ...prev,
      status: "completed",
      endTime: Date.now(),
      overallProgress: 100
    } : null);
    
    // Add to history
    setWorkflowHistory(prev => [workflow, ...prev.slice(0, 9)]);
  };

  const updateStepProgress = async (stepIndex: number, progress: number, status: WorkflowStep["status"], result?: any) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setWorkflow(prev => {
          if (!prev) return null;
          
          const updatedSteps = [...prev.steps];
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            progress,
            status,
            result
          };
          
          // Update next step to running if current step completed
          if (status === "completed" && stepIndex < updatedSteps.length - 1) {
            updatedSteps[stepIndex + 1] = {
              ...updatedSteps[stepIndex + 1],
              status: "running"
            };
          }
          
          const overallProgress = updatedSteps.reduce((sum, step) => sum + step.progress, 0) / updatedSteps.length;
          
          return {
            ...prev,
            steps: updatedSteps,
            overallProgress
          };
        });
        resolve(undefined);
      }, 1000 + Math.random() * 1000);
    });
  };

  const stopWorkflow = () => {
    setWorkflow(prev => prev ? {
      ...prev,
      status: "failed",
      endTime: Date.now(),
      steps: prev.steps.map(step => ({
        ...step,
        status: step.status === "running" ? "failed" : step.status,
        error: step.status === "running" ? "Workflow stopped by user" : step.error
      }))
    } : null);
    setIsExecuting(false);
    
    toast({
      title: "Workflow Stopped",
      description: "Workflow execution was stopped by user"
    });
  };

  const getStepIcon = (type: WorkflowStep["type"]) => {
    switch (type) {
      case "rag": return <Database className="h-4 w-4 text-blue-500" />;
      case "a2a": return <Network className="h-4 w-4 text-green-500" />;
      case "mcp": return <Wrench className="h-4 w-4 text-orange-500" />;
      case "deepseek": return <Brain className="h-4 w-4 text-purple-500" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running": return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Integrated Workflow Execution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-query">Workflow Query</Label>
            <Textarea
              id="workflow-query"
              placeholder="Enter your query to execute across all integrated systems (RAG, A2A, MCP, DeepSeek)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={executeWorkflow}
              disabled={isExecuting || !query.trim()}
              className="flex-1"
            >
              {isExecuting ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Executing Workflow...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Workflow
                </>
              )}
            </Button>
            
            {isExecuting && (
              <Button 
                onClick={stopWorkflow}
                variant="destructive"
                size="sm"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Sample Workflows:</Label>
            <div className="space-y-2">
              {sampleWorkflows.map((sample, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{sample.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(sample.query)}
                      disabled={isExecuting}
                    >
                      Use
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{sample.description}</p>
                  <p className="text-xs text-blue-600 italic">"{sample.query}"</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {workflow && (
        <Tabs defaultValue="execution" className="w-full">
          <TabsList>
            <TabsTrigger value="execution">Execution Progress</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="execution">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    {workflow.name}
                  </div>
                  <Badge 
                    variant={workflow.status === "completed" ? "default" : 
                            workflow.status === "failed" ? "destructive" : "secondary"}
                  >
                    {workflow.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{workflow.overallProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={workflow.overallProgress} />
                </div>

                <div className="space-y-3">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStepIcon(step.type)}
                          <span className="font-medium">{step.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <span className="text-sm text-muted-foreground">
                            {step.progress}%
                          </span>
                        </div>
                      </div>
                      
                      <Progress value={step.progress} className="mb-2" />
                      
                      {step.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {step.error}
                        </div>
                      )}
                      
                      {step.result && step.status === "completed" && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                          Step completed successfully
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {workflow.startTime && (
                  <div className="text-sm text-muted-foreground">
                    Started: {new Date(workflow.startTime).toLocaleString()}
                    {workflow.endTime && (
                      <span className="ml-4">
                        Duration: {((workflow.endTime - workflow.startTime) / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Results</CardTitle>
              </CardHeader>
              <CardContent>
                {workflow.status === "completed" ? (
                  <div className="space-y-4">
                    {workflow.steps.map((step) => (
                      step.result && (
                        <div key={step.id} className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            {getStepIcon(step.type)}
                            {step.name} Results
                          </h4>
                          <div className="bg-muted p-2 rounded text-sm">
                            <pre className="whitespace-pre-wrap">
                              {typeof step.result === 'object' 
                                ? JSON.stringify(step.result, null, 2)
                                : String(step.result)
                              }
                            </pre>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Workflow results will appear here when execution completes
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Workflow History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowHistory.map((hist) => (
                    <div key={hist.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{hist.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={hist.status === "completed" ? "default" : "destructive"}
                          >
                            {hist.status}
                          </Badge>
                          {hist.startTime && (
                            <span className="text-sm text-muted-foreground">
                              {new Date(hist.startTime).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{hist.query}</p>
                    </div>
                  ))}
                  {workflowHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No workflow history yet
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
