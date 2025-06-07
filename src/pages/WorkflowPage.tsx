
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, Brain, Database, Network, Wrench, Zap } from "lucide-react";
import IntegratedWorkflow from "@/components/enhanced-features/IntegratedWorkflow";

const WorkflowPage: React.FC = () => {
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

        {/* Workflow Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seamless Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All systems communicate through standardized protocols, ensuring reliable 
                data flow and consistent results across the entire workflow.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor each step of the workflow execution with detailed logging, 
                performance metrics, and status updates in real-time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Intelligent Orchestration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Workflows adapt based on query complexity, available resources, 
                and system capabilities to optimize performance and accuracy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Workflow Interface */}
        <IntegratedWorkflow />

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowPage;
