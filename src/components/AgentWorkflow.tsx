
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Cpu, AlertCircle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { AgentStatus } from "@/types/ipa-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AgentWorkflowProps {
  agents: AgentStatus[];
}

const AgentWorkflow: React.FC<AgentWorkflowProps> = ({ agents }) => {
  const [openAgents, setOpenAgents] = useState<Record<string, boolean>>({});

  const toggleAgent = (agent: string) => {
    setOpenAgents(prev => ({
      ...prev,
      [agent]: !prev[agent]
    }));
  };

  const getStatusIcon = (status: AgentStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-ipa-success" />;
      case "processing":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Cpu className="h-5 w-5 text-ipa-primary" />
          </motion.div>
        );
      case "failed":
        return <AlertCircle className="h-5 w-5 text-ipa-error" />;
      default:
        return <Circle className="h-5 w-5 text-ipa-muted" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DeepSeek Prompt Synthesis Swarm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {agents.map((agent, index) => (
            <React.Fragment key={agent.agent}>
              <motion.div
                className={`flex flex-col p-3 rounded-md ${
                  agent.status === "processing"
                    ? "bg-ipa-primary/10"
                    : agent.status === "completed"
                    ? "bg-ipa-success/10"
                    : agent.status === "failed"
                    ? "bg-ipa-error/10"
                    : ""
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Collapsible
                  open={openAgents[agent.agent]}
                  onOpenChange={() => toggleAgent(agent.agent)}
                >
                  <div className="flex items-center">
                    <div className="mr-3">{getStatusIcon(agent.status)}</div>
                    <div className="flex-1">
                      <div className="font-medium">{agent.agent}</div>
                      <div className="text-sm text-ipa-muted">
                        {agent.status === "processing"
                          ? "Working..."
                          : agent.status === "completed"
                          ? "Completed"
                          : agent.status === "failed"
                          ? "Failed"
                          : "Waiting"}
                      </div>
                    </div>
                    {(agent.reasoningContent || agent.output) && (
                      <CollapsibleTrigger asChild>
                        <button className="p-1 hover:bg-ipa-muted rounded-full">
                          {openAgents[agent.agent] ? (
                            <ChevronUp className="h-4 w-4 text-ipa-muted" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-ipa-muted" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                    )}
                  </div>
                  
                  <CollapsibleContent>
                    {agent.reasoningContent && (
                      <div className="mt-3 border-t border-ipa-border pt-3">
                        <div className="text-sm font-medium mb-1">Reasoning Process:</div>
                        <pre className="text-xs bg-ipa-background/50 p-2 rounded-md overflow-auto max-h-40">
                          {agent.reasoningContent}
                        </pre>
                      </div>
                    )}
                    {agent.output && !agent.reasoningContent && (
                      <div className="mt-3 border-t border-ipa-border pt-3">
                        <div className="text-sm font-medium mb-1">Output:</div>
                        <pre className="text-xs bg-ipa-background/50 p-2 rounded-md overflow-auto max-h-40">
                          {agent.output}
                        </pre>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
              
              {index < agents.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowRight className="h-4 w-4 text-ipa-muted" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentWorkflow;

