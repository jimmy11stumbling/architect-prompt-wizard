
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AgentStatus } from "@/types/ipa-types";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import AgentStatusIcon from "./AgentStatusIcon";

interface AgentContentProps {
  agent: AgentStatus;
  isOpen: boolean;
  onToggle: () => void;
}

const AgentContent: React.FC<AgentContentProps> = ({ agent, isOpen, onToggle }) => {
  // Determine if there's any content to show
  const hasContent = agent.output || agent.result;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onToggle}
      className="transition-all duration-200 ease-in-out"
    >
      <div className="flex items-center">
        <div className="mr-3">
          <AgentStatusIcon status={agent.status} />
        </div>
        <div className="flex-1">
          <div className="font-medium">{agent.name}</div>
          <div className="text-sm text-ipa-muted">
            {agent.status === "processing"
              ? "Working..."
              : agent.status === "completed"
              ? "Completed"
              : agent.status === "failed" || agent.status === "error"
              ? "Failed"
              : "Waiting"}
          </div>
        </div>
        {hasContent && (
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
      
      <CollapsibleContent className="transition-all duration-200 ease-in-out">
        {(agent.output || agent.result) && (
          <div className="mt-3 border-t border-ipa-border pt-3">
            <div className="text-sm font-medium mb-1">Output:</div>
            <div className="text-xs bg-ipa-background/50 p-2 rounded-md overflow-auto max-h-40 min-h-[40px] whitespace-pre-wrap break-words">
              {agent.output || agent.result}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AgentContent;
