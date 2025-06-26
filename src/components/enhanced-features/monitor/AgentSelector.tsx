
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { AgentName } from "@/types/ipa-types";

interface AgentSelectorProps {
  agents: AgentName[];
  selectedAgent: AgentName | null;
  onSelectAgent: (agent: AgentName | null) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ 
  agents, 
  selectedAgent, 
  onSelectAgent 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agent Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onSelectAgent(null)}
            variant={selectedAgent === null ? "default" : "outline"}
            size="sm"
          >
            All Agents
          </Button>
          {agents.map((agent) => (
            <Button
              key={agent}
              onClick={() => onSelectAgent(agent)}
              variant={selectedAgent === agent ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {agent.replace("Agent", "").replace("TechStackImplementation", "TechStack")}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentSelector;
