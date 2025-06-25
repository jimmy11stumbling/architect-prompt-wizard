
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Workflow, 
  Database, 
  Network, 
  Settings, 
  Brain, 
  Play, 
  Square,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { 
  systemIntegrationService, 
  IntegratedQueryRequest, 
  IntegratedQueryResponse 
} from "@/services/integration/systemIntegrationService";
import { useToast } from "@/hooks/use-toast";

const IntegratedWorkflow: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<IntegratedQueryResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState("");
  const [enabledServices, setEnabledServices] = useState({
    rag: true,
    a2a: true,
    mcp: true,
    deepseek: true
  });
  const { toast } = useToast();

  const executeWorkflow = async () => {
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
    setResponse(null);
    setActiveStep("Initializing workflow...");

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 10, 90);
        return newProgress;
      });
    }, 500);

    try {
      const request: IntegratedQueryRequest = {
        query: query.trim(),
        enableRAG: enabledServices.rag,
        enableA2A: enabledServices.a2a,
        enableMCP: enabledServices.mcp,
        enableDeepSeek: enabledServices.deepseek
      };

      setActiveStep("Executing integrated query...");
      
      const result = await systemIntegrationService.executeIntegratedQuery(request);
      
      setResponse(result);
      setProgress(100);
      setActiveStep("Workflow completed successfully");
      
      toast({
        title: "Workflow Complete",
        description: `Processed with ${result.integrationSummary.servicesUsed.length} services`,
      });

    } catch (error) {
      console.error("Workflow execution failed:", error);
      setActiveStep("Workflow failed");
      toast({
        title: "Workflow Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setIsRunning(false), 1000);
    }
  };

  const stopWorkflow = () => {
    setIsRunning(false);
    setProgress(0);
    setActiveStep("");
    toast({
      title: "Workflow Stopped",
      description: "The workflow execution has been stopped",
    });
  };

  const workflowSteps = [
    { id: "rag", name: "RAG Query", icon: Database, enabled: enabledServices.rag },
    { id: "a2a", name: "A2A Coordination", icon: Network, enabled: enabledServices.a2a },
    { id: "mcp", name: "MCP Tools", icon: Settings, enabled: enabledServices.mcp },
    { id: "deepseek", name: "DeepSeek Reasoning", icon: Brain, enabled: enabledServices.deepseek }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Integrated Multi-System Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Query Input */}
          <div className="space-y-2">
            <Label htmlFor="workflow-query">Workflow Query</Label>
            <Textarea
              id="workflow-query"
              placeholder="Enter a complex query that will be processed through multiple AI systems..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
          </div>

          {/* Service Configuration */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Service Configuration</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {workflowSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  <Switch
                    checked={step.enabled}
                    onCheckedChange={(checked) => 
                      setEnabledServices(prev => ({ ...prev, [step.id]: checked }))
                    }
                    disabled={isRunning}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Progress Display */}
          {isRunning && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Workflow Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground">{activeStep}</div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={executeWorkflow}
              disabled={isRunning || !query.trim()}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Running Workflow...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Workflow
                </>
              )}
            </Button>
            
            {isRunning && (
              <Button onClick={stopWorkflow} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>

          {/* Sample Workflows */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Sample Workflows:</Label>
            <div className="flex flex-wrap gap-2">
              {[
                "Analyze market trends and generate strategic recommendations",
                "Research competitor products and suggest improvements",
                "Process user feedback and identify key issues",
                "Generate comprehensive project documentation",
                "Analyze technical requirements and propose architecture"
              ].map((sample, index) => (
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
        </CardContent>
      </Card>

      {/* Results Display */}
      {response && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="services">Services Used</TabsTrigger>
            <TabsTrigger value="response">Full Response</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Workflow Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {response.integrationSummary.servicesUsed.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Services Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {response.processingTime}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Processing Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {(response.integrationSummary.successRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">Services Executed:</Label>
                  <div className="flex flex-wrap gap-2">
                    {response.integrationSummary.servicesUsed.map((service) => (
                      <Badge key={service} variant="default">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflowSteps.filter(step => step.enabled).map((step) => (
                <Card key={step.id}>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <step.icon className="h-4 w-4" />
                      {step.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Executed successfully</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.id === "rag" && "Retrieved relevant documents from knowledge base"}
                        {step.id === "a2a" && "Coordinated with specialized agents"}
                        {step.id === "mcp" && "Executed relevant tools and operations"}
                        {step.id === "deepseek" && "Applied advanced reasoning and analysis"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="response">
            <Card>
              <CardHeader>
                <CardTitle>Complete Workflow Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
                    {response.finalResponse}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {response.integrationSummary.totalSteps}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {Math.round(response.integrationSummary.totalSteps * response.integrationSummary.successRate)}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {response.processingTime}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {response.finalResponse.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Response Length</div>
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
