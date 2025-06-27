
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Brain, 
  Network, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Cpu
} from "lucide-react";
import { AgentNode } from "../types";

interface AgentPipelineProps {
  agents: AgentNode[];
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
}

const AgentPipeline: React.FC<AgentPipelineProps> = ({ agents, selectedAgent, onAgentSelect }) => {
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

  return (
    <Card className="card-nocodelos">
      <CardHeader>
        <CardTitle>Agent Execution Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedAgent === agent.id 
                  ? 'border-blue-400 bg-blue-500/10' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => onAgentSelect(agent.id)}
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
                      {agents.find(a => a.id === dep)?.name || dep}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPipeline;
