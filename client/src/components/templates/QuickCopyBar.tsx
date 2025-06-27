import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OneClickCopy from "./OneClickCopy";
import { Zap, Video, ShoppingCart, Calendar, Heart } from "lucide-react";
import { ProjectSpec } from "@/types/ipa-types";

const QuickCopyBar: React.FC = () => {
  const popularTemplates = [
    {
      id: "ai-saas",
      name: "AI SaaS Platform",
      icon: <Zap className="h-3 w-3" />,
      spec: {
        projectDescription: "A comprehensive AI-powered SaaS platform with advanced automation, analytics, and user management capabilities.",
        frontendTechStack: ["React", "Next.js"],
        backendTechStack: ["FastAPI", "PostgreSQL", "Redis"],
        customFrontendTech: ["TailwindCSS", "Framer Motion", "Recharts"],
        customBackendTech: ["Celery", "OpenAI API", "Stripe"],
        a2aIntegrationDetails: "Multi-agent system for automated task processing, intelligent routing, and collaborative AI workflows.",
        additionalFeatures: "Dashboard analytics, subscription management, API rate limiting, webhook system, AI model integration, user roles and permissions",
        ragVectorDb: "Pinecone",
        customRagVectorDb: "",
        mcpType: "MCP with Tools",
        customMcpType: "",
        advancedPromptDetails: "Implement RAG for contextual AI responses, MCP tools for external integrations, and A2A communication for complex workflows.",
        deploymentPreference: "Vercel",
        authenticationMethod: "NextAuth"
      } as ProjectSpec
    },
    {
      id: "video-editor",
      name: "Video Editor",
      icon: <Video className="h-3 w-3" />,
      spec: {
        projectDescription: "A professional video editing platform with real-time collaboration, timeline editing, effects library, and export capabilities for content creators.",
        frontendTechStack: ["React", "Next.js"],
        backendTechStack: ["NestJS", "PostgreSQL", "Redis"],
        customFrontendTech: ["TailwindCSS", "Framer Motion", "WebGL"],
        customBackendTech: ["FFmpeg", "WebRTC", "AWS S3"],
        a2aIntegrationDetails: "Agent communication for video processing tasks, collaborative editing sessions, and real-time notifications.",
        additionalFeatures: "Timeline editor, effects library, collaborative editing, video processing, export queue, user management, project sharing",
        ragVectorDb: "Pinecone",
        customRagVectorDb: "",
        mcpType: "MCP with Tools",
        customMcpType: "",
        advancedPromptDetails: "Implement semantic search for video assets, RAG for editing suggestions, and MCP tools for video processing workflows.",
        deploymentPreference: "Vercel",
        authenticationMethod: "JWT"
      } as ProjectSpec
    },
    {
      id: "ecommerce",
      name: "E-commerce",
      icon: <ShoppingCart className="h-3 w-3" />,
      spec: {
        projectDescription: "A modern e-commerce platform with AI-powered product recommendations, inventory management, and seamless payment processing.",
        frontendTechStack: ["React", "Next.js"],
        backendTechStack: ["Node.js", "PostgreSQL", "Redis"],
        customFrontendTech: ["TailwindCSS", "Framer Motion", "React Query"],
        customBackendTech: ["Stripe", "AWS S3", "Elasticsearch"],
        a2aIntegrationDetails: "AI agents for inventory management, price optimization, and customer service automation.",
        additionalFeatures: "Shopping cart, payment processing, inventory tracking, product recommendations, order management, customer reviews, admin dashboard",
        ragVectorDb: "Weaviate",
        customRagVectorDb: "",
        mcpType: "MCP with Resources",
        customMcpType: "",
        advancedPromptDetails: "Use RAG for intelligent product search, MCP for payment processing, and A2A for automated inventory management.",
        deploymentPreference: "Vercel",
        authenticationMethod: "NextAuth"
      } as ProjectSpec
    }
  ];

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Quick Copy Popular Templates</h3>
          <Badge variant="secondary" className="text-xs">Top Picks</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {popularTemplates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                {template.icon}
                <span className="text-xs font-medium">{template.name}</span>
              </div>
              <OneClickCopy 
                template={template}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickCopyBar;