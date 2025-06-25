
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause } from "lucide-react";
import { useWorkflowExecution } from "./hooks/useWorkflowExecution";
import WorkflowOverview from "./components/WorkflowOverview";
import AgentPipeline from "./components/AgentPipeline";
import PerformanceMetrics from "./components/PerformanceMetrics";
import ActivityLogs from "./components/ActivityLogs";

const AgentOrchestrationDashboard: React.FC = () => {
  const { activeWorkflow } = useWorkflowExecution();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

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
      {activeWorkflow && <WorkflowOverview workflow={activeWorkflow} />}

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline">Agent Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          {activeWorkflow && (
            <AgentPipeline
              agents={activeWorkflow.agents}
              selectedAgent={selectedAgent}
              onAgentSelect={setSelectedAgent}
            />
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {activeWorkflow && <PerformanceMetrics agents={activeWorkflow.agents} />}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <ActivityLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentOrchestrationDashboard;
