
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AgentStatus } from "@/types/ipa-types";
import AgentStatusIcon from "./AgentStatusIcon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AgentContentProps {
  agent: AgentStatus;
  isOpen: boolean;
  onToggle: () => void;
}

const AgentContent: React.FC<AgentContentProps> = ({ agent, isOpen, onToggle }) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onToggle}
    >
      <div className="flex items-center">
        <div className="mr-3">
          <AgentStatusIcon status={agent.status} />
        </div>
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
              {isOpen ? (
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
  );
};

export default AgentContent;
