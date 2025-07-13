import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Database, 
  Network, 
  Wrench, 
  Zap,
  Workflow,
  Settings,
  CheckCircle,
  ArrowRight,
  Play
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import DeepSeekReasonerPanel from "@/components/enhanced-features/DeepSeekReasonerPanel";
import RealTimeResponseMonitor from "@/components/enhanced-features/RealTimeResponseMonitor";
import IntegratedWorkflow from "@/components/enhanced-features/IntegratedWorkflow";
import LiveAgentMonitor from "@/components/enhanced-features/LiveAgentMonitor";
import ConsoleValidator from "@/components/enhanced-features/ConsoleValidator";

const EnhancedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-gradient">Enhanced AI Features</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Advanced AI capabilities with integrated reasoning, real-time monitoring, and seamless multi-system communication
            </p>
          </div>

          {/* System Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">DeepSeek Reasoner</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">RAG 2.0 Database</span>
                  <Badge variant="outline">Connected</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">A2A Protocol</span>
                  <Badge variant="outline">Operational</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">MCP Hub</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Features Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reasoner" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                DeepSeek Reasoner
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Integrated Workflow
              </TabsTrigger>
              <TabsTrigger value="monitor" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Real-time Monitor
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Live Agents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reasoner">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Advanced Reasoning Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Experience the power of DeepSeek's reasoning model with transparent chain-of-thought processing, 
                      integrated with RAG 2.0 knowledge retrieval, A2A agent coordination, and MCP tool access.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">32K</div>
                        <div className="text-sm text-muted-foreground">Reasoning Tokens</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">64K</div>
                        <div className="text-sm text-muted-foreground">Context Window</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">8K</div>
                        <div className="text-sm text-muted-foreground">Output Tokens</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <DeepSeekReasonerPanel />
              </div>
            </TabsContent>

            <TabsContent value="workflow">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="h-5 w-5" />
                      Integrated Multi-System Workflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Orchestrate complex workflows that seamlessly integrate DeepSeek reasoning, RAG database queries, 
                      A2A agent coordination, and MCP tool execution in a unified process.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 border rounded">
                        <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <div className="text-sm font-medium">RAG Query</div>
                        <div className="text-xs text-muted-foreground">Context Retrieval</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <Brain className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <div className="text-sm font-medium">Reasoning</div>
                        <div className="text-xs text-muted-foreground">Chain-of-Thought</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <Network className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <div className="text-sm font-medium">A2A Coord</div>
                        <div className="text-xs text-muted-foreground">Agent Tasks</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <Wrench className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <div className="text-sm font-medium">MCP Tools</div>
                        <div className="text-xs text-muted-foreground">Action Execution</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <IntegratedWorkflow />
              </div>
            </TabsContent>

            <TabsContent value="monitor">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Real-time System Monitor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Monitor all system communications, service status, and integration points in real-time. 
                      Track RAG queries, A2A messages, MCP tool calls, and DeepSeek reasoning processes as they happen.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">●</div>
                        <div className="text-sm text-muted-foreground">All Systems Online</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">📊</div>
                        <div className="text-sm text-muted-foreground">Real-time Metrics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">🔄</div>
                        <div className="text-sm text-muted-foreground">Live Updates</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">⚡</div>
                        <div className="text-sm text-muted-foreground">Instant Alerts</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <RealTimeResponseMonitor />
              </div>
            </TabsContent>

            <TabsContent value="agents">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Live Agent Monitoring & Validation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Real-time monitoring and validation of all agent responses, with live console output and 
                      comprehensive validation checks for every agent interaction.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">✓</div>
                        <div className="text-sm text-muted-foreground">Response Validation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">🔍</div>
                        <div className="text-sm text-muted-foreground">Live Monitoring</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">📊</div>
                        <div className="text-sm text-muted-foreground">Real-time Analytics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">🖥️</div>
                        <div className="text-sm text-muted-foreground">Console Output</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <LiveAgentMonitor />
              </div>
            </TabsContent>
          </Tabs>

          {/* Console Validator - Always visible */}
          <ConsoleValidator />
        </div>
      </div>
    </MainLayout>
  );
};

export default EnhancedPage;