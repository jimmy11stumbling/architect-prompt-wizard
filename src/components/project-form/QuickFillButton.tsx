
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ProjectSpec } from "@/types/ipa-types";

interface QuickFillButtonProps {
  onQuickFill: (spec: ProjectSpec) => void;
}

const quickFillTemplates: { name: string; spec: ProjectSpec }[] = [
  {
    name: "E-commerce Platform",
    spec: {
      projectDescription: "A modern e-commerce platform with real-time inventory management, AI-powered recommendations, and multi-vendor support. Features include advanced search, payment processing, order tracking, and customer analytics.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL", "Redis"],
      customFrontendTech: ["Stripe", "TailwindCSS"],
      customBackendTech: ["Elasticsearch", "Bull Queue"],
      a2aIntegrationDetails: "Implement agent communication for inventory updates, payment processing coordination, and recommendation engine updates between microservices.",
      additionalFeatures: "Real-time notifications, advanced analytics dashboard, multi-language support, progressive web app capabilities",
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "Use RAG for product recommendations and customer support. Implement MCP for payment gateway integration and inventory management tools.",
      deploymentPreference: "Vercel",
      authenticationMethod: "NextAuth.js"
    }
  },
  {
    name: "Video Editing Platform",
    spec: {
      projectDescription: "A web-based video editing platform with collaborative features, AI-powered editing suggestions, and cloud rendering. Supports multiple video formats, real-time collaboration, and automated subtitle generation.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["FastAPI", "PostgreSQL", "Redis"],
      customFrontendTech: ["FFmpeg.wasm", "WebGL"],
      customBackendTech: ["Celery", "AWS S3", "WebRTC"],
      a2aIntegrationDetails: "Agent communication for render job distribution, collaborative editing sessions, and AI processing pipeline coordination.",
      additionalFeatures: "Real-time collaboration, cloud rendering, AI-powered effects, automated transcription",
      ragVectorDb: "Weaviate",
      customRagVectorDb: "",
      mcpType: "MCP with Resources",
      customMcpType: "",
      advancedPromptDetails: "RAG for video effect suggestions and tutorial integration. MCP for accessing video processing tools and cloud storage resources.",
      deploymentPreference: "AWS",
      authenticationMethod: "Auth0"
    }
  },
  {
    name: "Fitness Tracking App",
    spec: {
      projectDescription: "A comprehensive fitness tracking application with AI personal trainer, social features, and wearable device integration. Includes workout planning, nutrition tracking, progress analytics, and community challenges.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL", "MongoDB"],
      customFrontendTech: ["Chart.js", "PWA"],
      customBackendTech: ["WebSocket", "Push Notifications"],
      a2aIntegrationDetails: "Agent communication for workout recommendations, nutrition analysis, and social interaction coordination between users and AI trainers.",
      additionalFeatures: "Wearable integration, social features, AI coaching, offline mode, push notifications",
      ragVectorDb: "Qdrant",
      customRagVectorDb: "",
      mcpType: "Standard MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for exercise database and nutrition information. MCP for wearable device data integration and health metrics processing.",
      deploymentPreference: "Google Cloud",
      authenticationMethod: "Firebase Auth"
    }
  },
  {
    name: "Content Creation Platform",
    spec: {
      projectDescription: "An AI-powered content creation platform for bloggers, marketers, and creators. Features include AI writing assistance, SEO optimization, content scheduling, analytics, and team collaboration tools.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "PostgreSQL", "Redis"],
      customFrontendTech: ["TinyMCE", "React Query"],
      customBackendTech: ["OpenAI API", "Scheduler"],
      a2aIntegrationDetails: "Agent coordination for content generation, SEO analysis, social media scheduling, and performance analytics across different content types.",
      additionalFeatures: "AI writing assistant, SEO tools, content calendar, team collaboration, analytics dashboard",
      ragVectorDb: "Chroma",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for content research and SEO best practices. MCP tools for social media APIs, analytics platforms, and AI writing services.",
      deploymentPreference: "Vercel",
      authenticationMethod: "NextAuth.js"
    }
  },
  {
    name: "Project Management Tool",
    spec: {
      projectDescription: "An intelligent project management platform with AI-powered task estimation, resource allocation, and predictive analytics. Features real-time collaboration, automated reporting, and integration with popular development tools.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL", "Redis"],
      customFrontendTech: ["Drag-and-Drop", "Gantt Charts"],
      customBackendTech: ["WebSocket", "Cron Jobs"],
      a2aIntegrationDetails: "Multi-agent system for task assignment, deadline prediction, resource optimization, and automated status updates between team members and project phases.",
      additionalFeatures: "AI task estimation, resource planning, automated reporting, time tracking, team analytics",
      ragVectorDb: "PGVector",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for project best practices and historical data analysis. Extended MCP for integration with development tools, calendar systems, and communication platforms.",
      deploymentPreference: "AWS",
      authenticationMethod: "OAuth 2.0"
    }
  }
];

const QuickFillButton: React.FC<QuickFillButtonProps> = ({ onQuickFill }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="h-4 w-4" />
          Quick Fill
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Template Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickFillTemplates.map((template, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onQuickFill(template.spec)}
            className="cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{template.name}</span>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {template.spec.projectDescription.substring(0, 80)}...
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickFillButton;
