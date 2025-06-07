
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workflow, Play, Pause, RotateCcw, CheckCircle, Clock, Database, Network, Wrench, Brain } from "lucide-react";
import { systemIntegrationService } from "@/services/integration/systemIntegrationService";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "error";
  icon: React.ReactNode;
  result?: any;
  duration?: number;
}

const IntegratedWorkflow: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const initializeWorkflow = (query: string): WorkflowStep[] => [
    {
      id: "rag",
      name: "RAG Database Query",
      description: "Retrieving relevant documentation and context",
      status: "pending",
      icon: <Database className="h-4 w-4 text-blue-500" />
    },
    {
      id: "a2a",
      name: "A2A Agent Coordination",
      description: "Coordinating with specialized agents",
      status: "pending",
      icon: <Network className="h-4 w-4 text-green-500" />
    },
    {
      id: "mcp",
      name: "MCP Tool Execution",
      description: "Accessing external tools and resources",
      status: "pending",
      icon: <Wrench className="h-4 w-4 text-orange-500" />
    },
    {
      id: "reasoning",
      name: "DeepSeek Reasoning",
      description: "Processing with chain-of-thought analysis",
      status: "pending",
      icon: <Brain className="h-4 w-4 text-purple-500" />
    }
  ];

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const runWorkflow = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a query to process",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setResult(null);
    
    const workflowSteps = initializeWorkflow(query);
    setSteps(workflowSteps);

    try {
      toast({
        title: "Workflow Started",
        description: "Executing integrated workflow across all systems"
      });

      // Simulate step-by-step execution with progress updates
      const totalSteps = workflowSteps.length;
      
      for (let i = 0; i < totalSteps; i++) {
        const step = workflowSteps[i];
        updateStep(step.id, { status: "running" });
        setProgress(((i) / totalSteps) * 100);

        // Simulate step execution time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        updateStep(step.id, { 
          status: "completed",
          duration: Math.floor(1000 + Math.random() * 2000)
        });
        setProgress(((i + 1) / totalSteps) * 100);
      }

      // Execute the actual integrated query
      const workflowResult = await systemIntegrationService.executeIntegratedQuery(query);
      setResult(workflowResult);

      toast({
        title: "Workflow Complete",
        description: "All systems executed successfully"
      });

    } catch (error) {
      console.error("Workflow execution failed:", error);
      
      // Mark current step as error
      const errorStep = steps.find(s => s.status === "running");
      if (errorStep) {
        updateStep(errorStep.id, { status: "error" });
      }

      toast({
        title: "Workflow Failed",
        description: error instanceof Error ? error.message : "Workflow execution failed",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetWorkflow = () => {
    setIsRunning(false);
    setProgress(0);
    setSteps([]);
    setResult(null);
    setQuery("");
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <div className="h-4 w-4 rounded-full bg-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const sampleWorkflows = [
    "Analyze the architecture differences between RAG 1.0 and RAG 2.0",
    "Design a multi-agent system for document processing",
    "Compare vector database solutions for production deployment",
    "Explain MCP protocol integration patterns",
    "Optimize agent coordination for real-time applications"
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Integrated Workflow Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-query">Workflow Query</Label>
            <Textarea
              id="workflow-query"
              placeholder="Enter a complex query that requires multi-system coordination..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={runWorkflow} 
              disabled={isRunning || !query.trim()}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Executing Workflow...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Integrated Workflow
                </>
              )}
            </Button>
            
            <Button onClick={resetWorkflow} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Sample Workflows */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Sample Workflows:</Label>
            <div className="flex flex-wrap gap-2">
              {sampleWorkflows.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(sample)}
                  className="text-xs"
                  disabled={isRunning}
                >
                  {sample}
                </Button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {(isRunning || steps.length > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Workflow Progress</Label>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    step.status === "completed" ? "bg-green-50 border-green-200" :
                    step.status === "running" ? "bg-blue-50 border-blue-200" :
                    step.status === "error" ? "bg-red-50 border-red-200" :
                    "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    {getStepStatusIcon(step.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {step.icon}
                      <h4 className="font-medium">{step.name}</h4>
                      <Badge variant={
                        step.status === "completed" ? "default" :
                        step.status === "running" ? "secondary" :
                        step.status === "error" ? "destructive" :
                        "outline"
                      }>
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    {step.duration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed in {step.duration}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Results */}
      {result && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="rag">RAG Results</TabsTrigger>
            <TabsTrigger value="a2a">A2A Coordination</TabsTrigger>
            <TabsTrigger value="mcp">MCP Execution</TabsTrigger>
            <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {result.ragResults?.documents?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">RAG Documents</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {result.a2aCoordination?.assignedAgent ? 1 : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">A2A Agents</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {result.mcpResults?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">MCP Tools</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {result.reasoning?.usage?.totalTokens?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Tokens</div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h4>Integrated Response:</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    {result.reasoning?.answer || "No response generated"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rag">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  RAG Database Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.ragResults?.documents?.length > 0 ? (
                  <div className="space-y-3">
                    {result.ragResults.documents.map((doc: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {doc.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{doc.source}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No RAG documents retrieved</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="a2a">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-green-500" />
                  A2A Agent Coordination
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.a2aCoordination?.assignedAgent ? (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Assigned Agent: {result.a2aCoordination.assignedAgent.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Agent ID: {result.a2aCoordination.assignedAgent.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {result.a2aCoordination.assignedAgent.status}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No agent coordination performed</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mcp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  MCP Tool Execution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.mcpResults?.length > 0 ? (
                  <div className="space-y-3">
                    {result.mcpResults.map((toolResult: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium">Tool: {toolResult.tool}</h4>
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <pre>{JSON.stringify(toolResult.result, null, 2)}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No MCP tools executed</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reasoning">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  DeepSeek Reasoning Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.reasoning ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Final Answer:</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        {result.reasoning.answer}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Chain-of-Thought:</h4>
                      <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                        {result.reasoning.reasoning}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Token Usage:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{result.reasoning.usage.promptTokens}</div>
                          <div className="text-xs text-muted-foreground">Prompt</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{result.reasoning.usage.completionTokens}</div>
                          <div className="text-xs text-muted-foreground">Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{result.reasoning.usage.reasoningTokens}</div>
                          <div className="text-xs text-muted-foreground">Reasoning</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{result.reasoning.usage.totalTokens}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reasoning data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default IntegratedWorkflow;
