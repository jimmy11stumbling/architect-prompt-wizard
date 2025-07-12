import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Code, Palette, Cloud, Bot, Rocket, Database, Globe, Smartphone, Brain } from "lucide-react";
import { ProjectSpec, PlatformType, TechStack } from "@/types/ipa-types";

interface PlatformTemplate {
  id: string;
  name: string;
  description: string;
  platform: PlatformType;
  category: string;
  icon: React.ReactNode;
  spec: ProjectSpec;
  tags: string[];
}

interface PlatformTemplatesProps {
  selectedPlatform: PlatformType;
  onSelectTemplate: (spec: ProjectSpec) => void;
}

const PlatformTemplates: React.FC<PlatformTemplatesProps> = ({ 
  selectedPlatform, 
  onSelectTemplate 
}) => {

  const createDefaultPlatformConfig = (platform: PlatformType) => {
    const configs = {
      bolt: {
        supportedFeatures: ["WebContainer", "Browser Runtime", "Instant Deploy"],
        preferredTechStack: ["React" as TechStack, "TypeScript" as TechStack, "Next.js" as TechStack],
        deploymentOptions: ["StackBlitz", "Vercel"],
        limitations: ["WebContainer limitations"],
        bestPractices: ["Use WebContainer-compatible packages"],
        promptStyle: "code-focused" as const,
        contextPreferences: ["Code examples", "File structure"],
        outputFormat: "step-by-step" as const
      },
      cursor: {
        supportedFeatures: ["AI Chat", "Codebase Context", "Code Completion"],
        preferredTechStack: ["TypeScript" as TechStack, "React" as TechStack, "Node.js" as TechStack],
        deploymentOptions: ["Vercel", "Railway"],
        limitations: ["Local development focused"],
        bestPractices: ["Use AI chat for refactoring"],
        promptStyle: "conversational" as const,
        contextPreferences: ["Codebase context", "AI assistance"],
        outputFormat: "detailed" as const
      },
      lovable: {
        supportedFeatures: ["Conversational UI", "Visual Design", "Template Generation"],
        preferredTechStack: ["React" as TechStack, "TypeScript" as TechStack],
        deploymentOptions: ["Lovable Cloud", "Vercel"],
        limitations: ["Template-based generation"],
        bestPractices: ["Use conversational prompts"],
        promptStyle: "conversational" as const,
        contextPreferences: ["User interface design"],
        outputFormat: "visual" as const
      },
      replit: {
        supportedFeatures: ["Cloud Hosting", "Collaboration", "AI Agent"],
        preferredTechStack: ["Python" as TechStack, "JavaScript" as TechStack, "React" as TechStack],
        deploymentOptions: ["Replit Hosting"],
        limitations: ["Cloud-based environment"],
        bestPractices: ["Use Replit AI Agent"],
        promptStyle: "structured" as const,
        contextPreferences: ["Cloud deployment"],
        outputFormat: "step-by-step" as const
      },
      windsurf: {
        supportedFeatures: ["Agent Workflows", "MCP Protocol", "Database Tools"],
        preferredTechStack: ["TypeScript" as TechStack, "React" as TechStack, "PostgreSQL" as TechStack],
        deploymentOptions: ["Railway", "Render"],
        limitations: ["Agent-based development"],
        bestPractices: ["Use agentic workflows"],
        promptStyle: "structured" as const,
        contextPreferences: ["Database development"],
        outputFormat: "detailed" as const
      }
    };
    return configs[platform];
  };

  const templates: PlatformTemplate[] = [
    // Bolt Templates
    {
      id: "bolt-react-spa",
      name: "React SPA with TypeScript",
      description: "Single page application optimized for StackBlitz WebContainer",
      platform: "bolt",
      category: "Frontend",
      icon: <Zap className="h-4 w-4" />,
      tags: ["React", "TypeScript", "SPA", "WebContainer"],
      spec: {
        targetPlatform: "bolt",
        platformSpecificConfig: createDefaultPlatformConfig("bolt"),
        projectDescription: "A modern React single-page application built with TypeScript, optimized for StackBlitz's WebContainer environment with instant deployment capabilities.",
        frontendTechStack: ["React", "TypeScript", "Next.js"],
        backendTechStack: [],
        customFrontendTech: ["Vite", "TailwindCSS"],
        customBackendTech: [],
        a2aIntegrationDetails: "Frontend-focused application with minimal backend dependencies, leveraging browser APIs for data persistence.",
        additionalFeatures: "Hot reload, TypeScript integration, component library, responsive design, PWA capabilities",
        ragVectorDb: "None",
        customRagVectorDb: "",
        mcpType: "None",
        customMcpType: "",
        advancedPromptDetails: "Create a React application optimized for WebContainer deployment with instant preview and no backend dependencies.",
        deploymentPreference: "StackBlitz",
        authenticationMethod: "Local Storage"
      }
    },

    // Cursor Templates  
    {
      id: "cursor-fullstack-ai",
      name: "AI-Powered Full-Stack App",
      description: "Complete application leveraging Cursor's AI capabilities",
      platform: "cursor",
      category: "Full-Stack",
      icon: <Brain className="h-4 w-4" />,
      tags: ["AI", "Full-Stack", "TypeScript", "Context-Aware"],
      spec: {
        targetPlatform: "cursor",
        platformSpecificConfig: createDefaultPlatformConfig("cursor"),
        projectDescription: "An intelligent full-stack application that leverages Cursor's AI-first development approach with codebase-aware assistance and advanced code completion.",
        frontendTechStack: ["React", "TypeScript", "Next.js"],
        backendTechStack: ["Node.js", "Express", "PostgreSQL"],
        customFrontendTech: ["TailwindCSS", "Framer Motion"],
        customBackendTech: ["Prisma", "tRPC"],
        a2aIntegrationDetails: "AI-assisted development with intelligent code suggestions and automated refactoring capabilities.",
        additionalFeatures: "AI code completion, intelligent debugging, automated testing, codebase analysis, Git integration",
        ragVectorDb: "Pinecone",
        customRagVectorDb: "",
        mcpType: "MCP with Tools",
        customMcpType: "",
        advancedPromptDetails: "Build using Cursor's AI chat for complex refactoring, leverage codebase context for intelligent suggestions, and implement AI-driven development workflows.",
        deploymentPreference: "Vercel",
        authenticationMethod: "NextAuth"
      }
    },

    // Lovable Templates
    {
      id: "lovable-design-system",
      name: "Design-First Application",
      description: "Beautiful UI-focused app built through conversational AI",
      platform: "lovable",
      category: "Design",
      icon: <Palette className="h-4 w-4" />,
      tags: ["UI/UX", "Design System", "Conversational", "Rapid Prototyping"],
      spec: {
        targetPlatform: "lovable",
        platformSpecificConfig: createDefaultPlatformConfig("lovable"),
        projectDescription: "A visually stunning application created through Lovable's conversational AI interface, focusing on exceptional user experience and modern design patterns.",
        frontendTechStack: ["React", "TypeScript"],
        backendTechStack: [],
        customFrontendTech: ["TailwindCSS", "Framer Motion", "Lucide Icons"],
        customBackendTech: ["Supabase"],
        a2aIntegrationDetails: "Conversational development workflow with iterative design improvements through natural language interactions.",
        additionalFeatures: "Component library, design system, animations, responsive layouts, accessibility features, user feedback systems",
        ragVectorDb: "None",
        customRagVectorDb: "",
        mcpType: "None",
        customMcpType: "",
        advancedPromptDetails: "Use conversational prompts to iterate on design, focus on user experience, and create visually appealing interfaces through natural language descriptions.",
        deploymentPreference: "Lovable Cloud",
        authenticationMethod: "Supabase Auth"
      }
    },

    // Replit Templates
    {
      id: "replit-collaborative-platform",
      name: "Collaborative Learning Platform",
      description: "Educational platform optimized for Replit's collaborative features",
      platform: "replit",
      category: "Education",
      icon: <Cloud className="h-4 w-4" />,
      tags: ["Education", "Collaboration", "Cloud", "Learning"],
      spec: {
        targetPlatform: "replit",
        platformSpecificConfig: createDefaultPlatformConfig("replit"),
        projectDescription: "An interactive learning platform that leverages Replit's collaborative development environment and AI Agent for educational content creation and sharing.",
        frontendTechStack: ["React", "JavaScript"],
        backendTechStack: ["Express", "SQLite"],
        customFrontendTech: ["React Router", "Chart.js"],
        customBackendTech: ["Socket.io", "Replit Database"],
        a2aIntegrationDetails: "Real-time collaboration features with live code sharing, peer programming, and AI-assisted learning paths.",
        additionalFeatures: "Real-time collaboration, code sharing, progress tracking, AI tutoring, peer review system, project templates",
        ragVectorDb: "None",
        customRagVectorDb: "",
        mcpType: "None",
        customMcpType: "",
        advancedPromptDetails: "Create educational content with Replit AI Agent, implement collaborative features for peer learning, and leverage cloud hosting for instant access.",
        deploymentPreference: "Replit Hosting",
        authenticationMethod: "Replit Auth"
      }
    },

    // Windsurf Templates
    {
      id: "windsurf-database-app",
      name: "Enterprise Database Application",
      description: "Complex data application with agentic workflows and MCP integration",
      platform: "windsurf",
      category: "Enterprise",
      icon: <Database className="h-4 w-4" />,
      tags: ["Database", "Enterprise", "MCP", "Agents"],
      spec: {
        targetPlatform: "windsurf",
        platformSpecificConfig: createDefaultPlatformConfig("windsurf"),
        projectDescription: "A sophisticated enterprise application leveraging Windsurf's agentic IDE capabilities with advanced database operations and Model Context Protocol integrations.",
        frontendTechStack: ["React", "TypeScript", "Next.js"],
        backendTechStack: ["Node.js", "PostgreSQL", "Redis"],
        customFrontendTech: ["TanStack Query", "Recharts", "React Hook Form"],
        customBackendTech: ["Drizzle ORM", "tRPC", "Docker"],
        a2aIntegrationDetails: "Multi-agent workflows for database operations, automated testing, and deployment pipelines with intelligent coordination between development agents.",
        additionalFeatures: "Advanced database tools, agent coordination, MCP protocol implementation, enterprise security, analytics dashboard, automated workflows",
        ragVectorDb: "Weaviate",
        customRagVectorDb: "",
        mcpType: "MCP with Tools",
        customMcpType: "",
        advancedPromptDetails: "Implement agentic development workflows, use MCP for database tool integration, and leverage Windsurf's agent coordination for complex enterprise features.",
        deploymentPreference: "Railway",
        authenticationMethod: "JWT"
      }
    }
  ];

  const filteredTemplates = templates.filter(template => template.platform === selectedPlatform);

  if (filteredTemplates.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No templates available for {selectedPlatform}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Badge variant="secondary">{filteredTemplates.length} available</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {template.icon}
                  <div>
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-xs">
                {template.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => onSelectTemplate(template.spec)}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlatformTemplates;