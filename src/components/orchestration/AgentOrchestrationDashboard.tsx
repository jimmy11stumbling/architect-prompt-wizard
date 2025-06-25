
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Network, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Cpu,
  ArrowRight,
  Play,
  Pause,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentNode {
  id: string;
  name: string;
  type: "reasoning" | "rag" | "mcp" | "a2a" | "coordinator";
  status: "idle" | "processing" | "completed" | "failed" | "waiting";
  progress: number;
  dependencies: string[];
  outputs: string[];
  performance: {
    avgProcessingTime: number;
    successRate: number;
    totalTasks: number;
  };
  currentTask?: string;
  lastUpdate: number;
}

interface WorkflowExecution {
  id: string;
  name: string;
  status: "running" | "paused" | "completed" | "failed";
  startTime: number;
  currentStep: number;
  totalSteps: number;
  agents: AgentNode[];
}

const AgentOrchestrationDashboard: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowExecution | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with mock data
    const mockWorkflow: WorkflowExecution = {
      id: "wf_001",
      name: "Cursor AI Prompt Generation",
      status: "running",
      startTime: Date.now() - 45000,
      currentStep: 3,
      totalSteps: 8,
      agents: [
        {
          id: "agent_coordinator",
          name: "Workflow Coordinator",
          type: "coordinator",
          status: "completed",
          progress: 100,
          dependencies: [],
          outputs: ["agent_reasoning", "agent_rag"],
          performance: { avgProcessingTime: 1.2, successRate: 0.98, totalTasks: 156 },
          lastUpdate: Date.now() - 30000
        },
        {
          id: "agent_reasoning",
          name: "DeepSeek Reasoner",
          type: "reasoning",
          status: "processing",
          progress: 65,
          dependencies: ["agent_coordinator"],
          outputs: ["agent_mcp"],
          performance: { avgProcessingTime: 3.4, successRate: 0.94, totalTasks: 89 },
          currentTask: "Analyzing project requirements and generating technical specifications",
          lastUpdate: Date.now() - 1000
        },
        {
          id: "agent_rag",
          name: "RAG Knowledge Retriever",
          type: "rag",
          status: "processing",
          progress: 80,
          dependencies: ["agent_coordinator"],
          outputs: ["agent_mcp"],
          performance: { avgProcessingTime: 2.1, successRate: 0.96, totalTasks: 203 },
          currentTask: "Retrieving relevant documentation and best practices",
          lastUpdate: Date.now() - 500
        },
        {
          id: "agent_mcp",
          name: "MCP Tool Executor",
          type: "mcp",
          status: "waiting",
          progress: 0,
          dependencies: ["agent_reasoning", "agent_rag"],
          outputs: ["agent_a2a"],
          performance: { avgProcessingTime: 1.8, successRate: 0.92, totalTasks: 127 },
          lastUpdate: Date.now() - 15000
        },
        {
          id: "agent_a2a",
          name: "A2A Coordinator",
          type: "a2a",
          status: "idle",
          progress: 0,
          dependencies: ["agent_mcp"],
          outputs: [],
          performance: { avgProcessingTime: 2.5, successRate: 0.95, totalTasks: 78 },
          lastUpdate: Date.now() - 20000
        }
      ]
    };

    setActiveWorkflow(mockWorkflow);
    setWorkflows([mockWorkflow]);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveWorkflow(prev => {
        if (!prev) return prev;
        
        const updatedAgents = prev.agents.map(agent => {
          if (agent.status === "processing") {
            const newProgress = Math.min(agent.progress + Math.random() * 5, 100);
            const newStatus: AgentNode['status'] = newProgress >= 100 ? "completed" : "processing";
            return {
              ...agent,
              progress: newProgress,
              status: newStatus,
              lastUpdate: Date.now()
            };
          }
          return agent;
        });

        return { ...prev, agents: updatedAgents };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: AgentNode['status']) => {
    switch (status) {
      case "completed": return "text-green-400";
      case "processing": return "text-blue-400";
      case "failed": return "text-red-400";
      case "waiting": return "text-yellow-400";
      default: return "text-slate-400";
    }
  };

  const getStatusIcon = (status: AgentNode['status']) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "processing": return <Cpu className="h-4 w-4 animate-spin" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      case "waiting": return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAgentTypeIcon = (type: AgentNode['type']) => {
    switch (type) {
      case "reasoning": return <Brain className="h-5 w-5" />;
      case "rag": return <Network className="h-5 w-5" />;
      case "coordinator": return <Activity className="h-5 w-5" />;
      default: return <Cpu className="h-5 w-5" />;
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Multi-Agent Orchestration</h1>
          <p className="text-slate-400 mt-1">Real-time coordination and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-1" />
            Start New
          </Button>
          <Button variant="outline" size="sm">
            <Pause className="h-4 w-4 mr-1" />
            Pause All
          </Button>
        </div>
      </div>

      {/* Workflow Overview */}
      {activeWorkflow && (
        <Card className="card-nocodelos">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                {activeWorkflow.name}
              </CardTitle>
              <Badge variant="outline" className="text-blue-300 border-blue-400/30">
                {activeWorkflow.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">
                  {activeWorkflow.currentStep}/{activeWorkflow.totalSteps}
                </div>
                <div className="text-sm text-slate-400">Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">
                  {activeWorkflow.agents.filter(a => a.status === "completed").length}
                </div>
                <div className="text-sm text-slate-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">
                  {activeWorkflow.agents.filter(a => a.status === "processing").length}
                </div>
                <div className="text-sm text-slate-400">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {formatDuration(Date.now() - activeWorkflow.startTime)}
                </div>
                <div className="text-sm text-slate-400">Duration</div>
              </div>
            </div>
            <Progress 
              value={(activeWorkflow.currentStep / activeWorkflow.totalSteps) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline">Agent Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Agent Pipeline Visualization */}
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle>Agent Execution Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeWorkflow?.agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      selectedAgent === agent.id 
                        ? 'border-blue-400 bg-blue-500/10' 
                        : 'border-slate-600 hover:border-slate-500'
                    } cursor-pointer transition-all`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getAgentTypeIcon(agent.type)}
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                          {getStatusIcon(agent.status)}
                          <span className="text-sm capitalize">{agent.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-400">
                          {agent.progress}%
                        </div>
                        <Progress value={agent.progress} className="w-20 h-2" />
                      </div>
                    </div>
                    
                    {agent.currentTask && (
                      <div className="mt-2 text-sm text-slate-300">
                        {agent.currentTask}
                      </div>
                    )}

                    {agent.dependencies.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <span>Depends on:</span>
                        {agent.dependencies.map(dep => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {activeWorkflow?.agents.find(a => a.id === dep)?.name || dep}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeWorkflow?.agents.map((agent) => (
              <Card key={agent.id} className="card-nocodelos">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {getAgentTypeIcon(agent.type)}
                    {agent.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Success Rate</span>
                      <span className="text-sm font-medium">
                        {(agent.performance.successRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Avg Processing</span>
                      <span className="text-sm font-medium">
                        {agent.performance.avgProcessingTime}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Total Tasks</span>
                      <span className="text-sm font-medium">
                        {agent.performance.totalTasks}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle>Real-time Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 text-sm">
                      <span className="text-slate-400 text-xs">
                        {new Date(Date.now() - i * 5000).toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {i % 3 === 0 ? 'INFO' : i % 3 === 1 ? 'SUCCESS' : 'PROCESSING'}
                      </Badge>
                      <span className="text-slate-300">
                        Agent {['Reasoner', 'RAG', 'MCP', 'A2A'][i % 4]} {
                          ['started processing', 'completed task', 'retrieved data', 'coordinated with'][i % 4]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentOrchestrationDashboard;
