
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Database, Network, Wrench, Play, CheckCircle, AlertCircle } from "lucide-react";
import { deepseekReasonerService } from "@/services/deepseek/deepseekReasonerService";
import { ragService } from "@/services/rag/ragService";
import { a2aService } from "@/services/a2a/a2aService";
import { mcpService } from "@/services/mcp/mcpService";

interface WorkflowStep {
  id: string;
  name: string;
  service: string;
  status: "pending" | "running" | "completed" | "error";
  result?: any;
  duration?: number;
}

interface WorkflowResult {
  steps: WorkflowStep[];
  finalResult: any;
  totalDuration: number;
  success: boolean;
}

const IntegratedWorkflow: React.FC = () => {
  const [query, setQuery] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);
  const [realTimeLog, setRealTimeLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setRealTimeLog(prev => [...prev.slice(-19), logEntry]);
  };

  const executeIntegratedWorkflow = async () => {
    if (!query.trim()) return;

    setRunning(true);
    setProgress(0);
    setWorkflowResult(null);
    setRealTimeLog([]);

    const startTime = Date.now();
    const steps: WorkflowStep[] = [
      { id: "rag", name: "RAG Knowledge Retrieval", service: "RAG 2.0", status: "pending" },
      { id: "a2a", name: "A2A Agent Coordination", service: "A2A Protocol", status: "pending" },
      { id: "mcp", name: "MCP Tool Execution", service: "MCP Hub", status: "pending" },
      { id: "reasoning", name: "DeepSeek Reasoning", service: "DeepSeek Reasoner", status: "pending" }
    ];

    try {
      addToLog("🚀 Starting integrated workflow execution");
      setProgress(10);

      // Step 1: RAG Knowledge Retrieval
      addToLog("📚 Step 1: Retrieving relevant knowledge from RAG database");
      steps[0].status = "running";
      const stepStartTime = Date.now();

      const ragResults = await ragService.query({
        query,
        limit: 5,
        threshold: 0.3
      });

      steps[0].status = "completed";
      steps[0].result = ragResults;
      steps[0].duration = Date.now() - stepStartTime;
      addToLog(`✅ RAG: Found ${ragResults.documents.length} relevant documents`);
      setProgress(25);

      // Step 2: A2A Agent Coordination
      addToLog("🤝 Step 2: Coordinating with A2A agents");
      steps[1].status = "running";
      const a2aStartTime = Date.now();

      const delegation = await a2aService.delegateTask(
        `Integrated workflow: ${query}`,
        ["workflow-support", "task-coordination"]
      );

      let a2aMessages = [];
      if (delegation.assignedAgent) {
        const message = await a2aService.sendMessage({
          from: "integrated-workflow",
          to: delegation.assignedAgent.id,
          type: "request",
          payload: {
            query,
            ragResults: ragResults.documents.slice(0, 2), // Share limited context
            workflowStep: "coordination"
          }
        });
        a2aMessages.push(message);
      }

      steps[1].status = "completed";
      steps[1].result = { delegation, messages: a2aMessages };
      steps[1].duration = Date.now() - a2aStartTime;
      addToLog(`✅ A2A: Coordinated with ${delegation.assignedAgent?.name || "no agent"}`);
      setProgress(50);

      // Step 3: MCP Tool Execution
      addToLog("🔧 Step 3: Executing MCP tools");
      steps[2].status = "running";
      const mcpStartTime = Date.now();

      const mcpResults = [];
      
      // Execute relevant tools based on query content
      if (query.toLowerCase().includes("search") || query.toLowerCase().includes("find")) {
        const searchResult = await mcpService.callTool("search_web", { query });
        mcpResults.push({ tool: "search_web", result: searchResult });
      }

      if (query.toLowerCase().includes("file") || query.toLowerCase().includes("document")) {
        const fileResult = await mcpService.callTool("read_file", { 
          path: "sample-document.txt" 
        });
        mcpResults.push({ tool: "read_file", result: fileResult });
      }

      // Always try to get available resources
      const resources = await mcpService.listResources();
      mcpResults.push({ tool: "list_resources", result: resources });

      steps[2].status = "completed";
      steps[2].result = mcpResults;
      steps[2].duration = Date.now() - mcpStartTime;
      addToLog(`✅ MCP: Executed ${mcpResults.length} tool operations`);
      setProgress(75);

      // Step 4: DeepSeek Reasoning with all context
      addToLog("🧠 Step 4: Processing with DeepSeek Reasoner");
      steps[3].status = "running";
      const reasoningStartTime = Date.now();

      const contextData = {
        ragDocuments: ragResults.documents,
        a2aCoordination: delegation,
        mcpToolResults: mcpResults
      };

      const enhancedContext = `
RAG Retrieved Documents:
${ragResults.documents.map(doc => `- ${doc.title}: ${doc.content.substring(0, 200)}...`).join('\n')}

A2A Agent Coordination:
- Assigned Agent: ${delegation.assignedAgent?.name || "None"}
- Status: ${delegation.status}

MCP Tool Results:
${mcpResults.map(result => `- ${result.tool}: ${JSON.stringify(result.result).substring(0, 100)}...`).join('\n')}
      `;

      const reasoningResult = await deepseekReasonerService.processQuery({
        prompt: query,
        context: enhancedContext,
        maxTokens: 4096,
        ragEnabled: false, // Already done manually
        a2aEnabled: false, // Already done manually
        mcpEnabled: false  // Already done manually
      });

      steps[3].status = "completed";
      steps[3].result = reasoningResult;
      steps[3].duration = Date.now() - reasoningStartTime;
      addToLog(`✅ Reasoning: Generated comprehensive response with full context`);
      setProgress(100);

      const totalDuration = Date.now() - startTime;
      const finalResult: WorkflowResult = {
        steps,
        finalResult: reasoningResult,
        totalDuration,
        success: true
      };

      setWorkflowResult(finalResult);
      addToLog(`🎉 Workflow completed successfully in ${totalDuration}ms`);

    } catch (error) {
      addToLog(`❌ Workflow failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      
      // Mark current step as error
      const errorStepIndex = steps.findIndex(step => step.status === "running");
      if (errorStepIndex >= 0) {
        steps[errorStepIndex].status = "error";
      }

      setWorkflowResult({
        steps,
        finalResult: null,
        totalDuration: Date.now() - startTime,
        success: false
      });
    } finally {
      setRunning(false);
    }
  };

  const clearWorkflow = () => {
    setQuery("");
    setWorkflowResult(null);
    setRealTimeLog([]);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Integrated Multi-System Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your workflow query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && executeIntegratedWorkflow()}
              className="flex-1"
            />
            <Button 
              onClick={executeIntegratedWorkflow}
              disabled={running || !query.trim()}
            >
              {running ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute Workflow
            </Button>
            <Button variant="outline" onClick={clearWorkflow}>
              Clear
            </Button>
          </div>

          {running && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Executing integrated workflow...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {realTimeLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Real-time Execution Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                  {realTimeLog.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {workflowResult && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Workflow Overview</TabsTrigger>
            <TabsTrigger value="steps">Step Details</TabsTrigger>
            <TabsTrigger value="result">Final Result</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {workflowResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  Workflow Execution Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {workflowResult.steps.map((step, index) => (
                    <div key={step.id} className={`p-3 border rounded ${
                      step.status === "completed" ? "border-green-200 bg-green-50" :
                      step.status === "error" ? "border-red-200 bg-red-50" :
                      step.status === "running" ? "border-blue-200 bg-blue-50" :
                      "border-gray-200 bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {step.service === "RAG 2.0" && <Database className="h-4 w-4" />}
                        {step.service === "A2A Protocol" && <Network className="h-4 w-4" />}
                        {step.service === "MCP Hub" && <Wrench className="h-4 w-4" />}
                        {step.service === "DeepSeek Reasoner" && <Brain className="h-4 w-4" />}
                        <Badge variant={
                          step.status === "completed" ? "default" :
                          step.status === "error" ? "destructive" : "secondary"
                        }>
                          {step.status}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">{step.name}</div>
                      <div className="text-xs text-muted-foreground">{step.service}</div>
                      {step.duration && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.duration}ms
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps">
            <div className="space-y-4">
              {workflowResult.steps.map((step, index) => (
                <Card key={step.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {step.service === "RAG 2.0" && <Database className="h-5 w-5 text-blue-500" />}
                      {step.service === "A2A Protocol" && <Network className="h-5 w-5 text-green-500" />}
                      {step.service === "MCP Hub" && <Wrench className="h-5 w-5 text-orange-500" />}
                      {step.service === "DeepSeek Reasoner" && <Brain className="h-5 w-5 text-purple-500" />}
                      {step.name}
                      <Badge variant={
                        step.status === "completed" ? "default" :
                        step.status === "error" ? "destructive" : "secondary"
                      } className="ml-auto">
                        {step.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {step.result && (
                      <div className="text-sm bg-muted p-3 rounded max-h-32 overflow-y-auto">
                        <pre>{JSON.stringify(step.result, null, 2)}</pre>
                      </div>
                    )}
                    {step.duration && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Execution time: {step.duration}ms
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="result">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Final Reasoning Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workflowResult.finalResult ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Answer:</div>
                      <div className="text-sm bg-green-50 dark:bg-green-950 p-3 rounded">
                        {workflowResult.finalResult.answer}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Chain of Thought:</div>
                      <div className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{workflowResult.finalResult.reasoning}</pre>
                      </div>
                    </div>
                    {workflowResult.finalResult.usage && (
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">
                          Total: {workflowResult.finalResult.usage.totalTokens} tokens
                        </Badge>
                        <Badge variant="outline">
                          Reasoning: {workflowResult.finalResult.usage.reasoningTokens} tokens
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No final result available. Workflow may have failed.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{workflowResult.totalDuration}ms</div>
                    <div className="text-sm text-muted-foreground">Total Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{workflowResult.steps.filter(s => s.status === "completed").length}</div>
                    <div className="text-sm text-muted-foreground">Completed Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {workflowResult.success ? "100%" : "Failed"}
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Step-by-Step Timing:</div>
                  <div className="space-y-2">
                    {workflowResult.steps.map((step) => (
                      <div key={step.id} className="flex justify-between items-center text-sm">
                        <span>{step.name}</span>
                        <span className="font-mono">{step.duration || 0}ms</span>
                      </div>
                    ))}
                  </div>
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
