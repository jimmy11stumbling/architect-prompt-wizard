
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Zap } from "lucide-react";
import { ProjectSpec } from "@/types/ipa-types";

interface QuickFillButtonProps {
  onQuickFill: (spec: ProjectSpec) => void;
}

const QuickFillButton: React.FC<QuickFillButtonProps> = ({ onQuickFill }) => {
  const templates: Record<string, ProjectSpec> = {
    "E-commerce Platform": {
      projectDescription: "A modern e-commerce platform with AI-powered product recommendations, real-time inventory management, and seamless payment processing. Features include user authentication, product catalog, shopping cart, order management, and admin dashboard.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "PostgreSQL"],
      customFrontendTech: [],
      customBackendTech: [],
      ragVectorDb: "Chroma",
      customRagVectorDb: "",
      mcpType: "Enhanced MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Implement agent communication for inventory updates, recommendation engine, and order processing coordination.",
      advancedPromptDetails: "Use context-aware prompting for product recommendations and customer service automation.",
      additionalFeatures: "Payment gateway integration, email notifications, analytics dashboard, mobile responsiveness",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    },
    "AI Chat Application": {
      projectDescription: "An intelligent chat application with multi-agent conversation support, document analysis, and real-time collaboration features. Includes AI-powered responses, file sharing, and conversation management.",
      frontendTechStack: ["React", "Vue"],
      backendTechStack: ["FastAPI", "MongoDB"],
      customFrontendTech: [],
      customBackendTech: [],
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "Enterprise MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Multi-agent conversation handling, document processing agents, and real-time message routing between AI agents.",
      advancedPromptDetails: "Context-aware conversation management, document summarization, and intelligent response generation.",
      additionalFeatures: "File upload/sharing, real-time messaging, conversation history, user presence indicators",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    },
    "Data Analytics Dashboard": {
      projectDescription: "A comprehensive data analytics platform with AI-driven insights, real-time visualization, and automated reporting. Features interactive charts, KPI tracking, and predictive analytics.",
      frontendTechStack: ["React", "Angular"],
      backendTechStack: ["Django", "PostgreSQL"],
      customFrontendTech: [],
      customBackendTech: [],
      ragVectorDb: "Qdrant",
      customRagVectorDb: "",
      mcpType: "Standard MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Data processing agents, analytics computation, and report generation coordination.",
      advancedPromptDetails: "Intelligent data interpretation, automated insights generation, and natural language query processing.",
      additionalFeatures: "Interactive charts, data export, scheduled reports, user permissions, API integrations",
      deploymentPreference: "AWS",
      authenticationMethod: "SAML"
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Quick Fill
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {Object.entries(templates).map(([name, spec]) => (
          <DropdownMenuItem key={name} onClick={() => onQuickFill(spec)}>
            <div className="space-y-1">
              <div className="font-medium">{name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {spec.projectDescription.substring(0, 100)}...
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickFillButton;
