
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Network, Activity, Cpu } from "lucide-react";
import { AgentNode } from "../types";

interface PerformanceMetricsProps {
  agents: AgentNode[];
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ agents }) => {
  const getAgentTypeIcon = (type: AgentNode['type']) => {
    switch (type) {
      case "reasoning": return <Brain className="h-4 w-4" />;
      case "rag": return <Network className="h-4 w-4" />;
      case "coordinator": return <Activity className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {agents.map((agent) => (
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
  );
};

export default PerformanceMetrics;
