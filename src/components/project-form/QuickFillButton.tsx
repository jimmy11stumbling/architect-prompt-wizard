
import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSpec } from "@/types/ipa-types";

interface QuickFillButtonProps {
  onQuickFill: (spec: ProjectSpec) => void;
}

const QuickFillButton: React.FC<QuickFillButtonProps> = ({ onQuickFill }) => {
  const handleQuickFill = () => {
    // Example quick fill for demo purposes with advanced features
    const quickFillSpec: ProjectSpec = {
      projectDescription: "A collaborative task management app with real-time updates and A2A communication.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "ShadCN UI"],
      customBackendTech: ["Redis Pub/Sub", "WebSockets"],
      a2aIntegrationDetails: "Implement agent-to-agent communication for task assignment and notification subsystems.",
      additionalFeatures: "User authentication, role-based permissions, kanban board view, activity timeline, and email notifications.",
      ragVectorDb: "PGVector",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "Leverage semantic search for smart task matching. Implement RAG 2.0 with hybrid search and metadata filtering for knowledge retrieval. Use Model Context Protocol for tools integration in agent workflows."
    };
    onQuickFill(quickFillSpec);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-1" 
      onClick={handleQuickFill}
    >
      <Sparkles className="h-4 w-4 text-ipa-accent" /> Quick Fill Example
    </Button>
  );
};

export default QuickFillButton;
