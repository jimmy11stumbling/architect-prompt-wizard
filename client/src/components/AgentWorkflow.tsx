import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AgentStatus } from "@/types/ipa-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AgentContent from "./agent-workflow/AgentContent";

interface AgentWorkflowProps {
  agents: AgentStatus[];
  isGenerating: boolean;
}

const AgentWorkflow: React.FC<AgentWorkflowProps> = ({ agents, isGenerating }) => {
  const [openAgents, setOpenAgents] = useState<Record<string, boolean>>({});

  const toggleAgent = (agent: string) => {
    setOpenAgents(prev => ({
      ...prev,
      [agent]: !prev[agent]
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          DeepSeek Prompt Synthesis Swarm
          {isGenerating && (
            <span className="ml-2 text-sm text-ipa-primary animate-pulse">
              (Processing...)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {agents.map((agent, index) => {
            // Create a unique key for each agent
            const key = `${agent.name}-${index}`;
            return (
              <React.Fragment key={key}>
                <motion.div
                  className={`flex flex-col p-3 rounded-md ${
                    agent.status === "processing"
                      ? "bg-ipa-primary/10"
                      : agent.status === "completed"
                      ? "bg-ipa-success/10"
                      : agent.status === "failed" || agent.status === "error"
                      ? "bg-ipa-error/10"
                      : ""
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AgentContent 
                    agent={agent} 
                    isOpen={!!openAgents[agent.name]} 
                    onToggle={() => toggleAgent(agent.name)} 
                  />
                </motion.div>
                
                {index < agents.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowRight className="h-4 w-4 text-ipa-muted" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentWorkflow;
