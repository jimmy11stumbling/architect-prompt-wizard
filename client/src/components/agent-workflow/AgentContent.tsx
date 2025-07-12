import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AgentStatus } from "@/types/ipa-types";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import AgentStatusIcon from "./AgentStatusIcon";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, AlertCircle, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AgentStatusIcon } from './AgentStatusIcon';

interface AgentContentProps {
  agent: {
    id: string;
    name: string;
    status: 'idle' | 'processing' | 'completed' | 'error';
    response?: string;
    processingTime?: number;
    error?: string;
  };
}

const AgentContent: React.FC<AgentContentProps> = ({ agent, isOpen, onToggle }) => {
  // Determine if there's any content to show
  const hasContent = agent.output || agent.result;
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

    const handleCopyResponse = async () => {
    if (!agent.response) return;

    try {
      await navigator.clipboard.writeText(agent.response);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `${agent.name} response copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy response to clipboard",
        variant: "destructive",
      });
    }
  };

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
             <div className="flex items-center justify-between">
             <div className="text-xs bg-ipa-background/50 p-2 rounded-md overflow-auto max-h-40 min-h-[40px] whitespace-pre-wrap break-words">
              {agent.output || agent.result}
            </div>
             {agent.response && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyResponse}
                className="h-6 px-2 text-xs"
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="ml-1">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="ml-1">Copy</span>
                  </>
                )}
              </Button>
            )}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AgentContent;