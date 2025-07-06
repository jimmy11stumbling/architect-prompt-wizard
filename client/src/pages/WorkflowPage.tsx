
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workflow, Brain, Database, Network, Wrench, Zap, Settings, BarChart } from "lucide-react";
import IntegratedWorkflow from "@/components/enhanced-features/IntegratedWorkflow";
import WorkflowBuilder from "@/components/workflow/WorkflowBuilder";
import WorkflowDashboard from "@/components/workflow/WorkflowDashboard";
import WorkflowExecutionTest from "@/components/workflow/WorkflowExecutionTest";
import WorkflowNotifications from "@/components/workflow/WorkflowNotifications";
import { WorkflowDefinition } from "@/types/workflow-types";

const WorkflowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleWorkflowCreated = (workflow: WorkflowDefinition) => {
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Workflow className="h-8 w-8 text-primary" />
            <span className="text-gradient">Integrated Workflow Engine</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Orchestrate complex multi-system workflows that seamlessly integrate DeepSeek reasoning, RAG database queries, 
            A2A agent coordination, and MCP tool execution in unified processes
          </p>
        </div>

        {/* Workflow Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Workflow Execution Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-3 p-4 border rounded-lg">
                <Database className="h-8 w-8 mx-auto text-blue-500" />
                <div>
                  <h3 className="font-semibold">1. RAG Retrieval</h3>
                  <p className="text-sm text-muted-foreground">
                    Query the RAG 2.0 database for relevant context and documentation
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-3 p-4 border rounded-lg">
                <Network className="h-8 w-8 mx-auto text-green-500" />
                <div>
                  <h3 className="font-semibold">2. A2A Coordination</h3>
                  <p className="text-sm text-muted-foreground">
                    Coordinate with specialized agents for task delegation and support
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-3 p-4 border rounded-lg">
                <Wrench className="h-8 w-8 mx-auto text-orange-500" />
                <div>
                  <h3 className="font-semibold">3. MCP Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Execute relevant tools and access external resources via MCP
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-3 p-4 border rounded-lg">
                <Brain className="h-8 w-8 mx-auto text-purple-500" />
                <div>
                  <h3 className="font-semibold">4. DeepSeek Reasoning</h3>
                  <p className="text-sm text-muted-foreground">
                    Process all context with advanced chain-of-thought reasoning
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Workflow Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="execute" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Execute
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Test
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <WorkflowDashboard />
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <WorkflowBuilder onWorkflowCreated={handleWorkflowCreated} />
          </TabsContent>

          <TabsContent value="execute" className="space-y-6">
            <IntegratedWorkflow />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <WorkflowExecutionTest />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WorkflowDashboard />
              </div>
              <div>
                <WorkflowNotifications />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Workflow Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Communication Protocols</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• A2A Protocol for agent coordination</li>
                  <li>• MCP for tool and resource access</li>
                  <li>• Real-time status updates via event streams</li>
                  <li>• Secure authentication and authorization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Parallel execution where possible</li>
                  <li>• Intelligent caching and optimization</li>
                  <li>• Error handling and recovery mechanisms</li>
                  <li>• Comprehensive execution metrics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Production Ready</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Workflow persistence and recovery</li>
                  <li>• Real-time monitoring and alerting</li>
                  <li>• Resource usage tracking</li>
                  <li>• Visual workflow builder</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowPage;
