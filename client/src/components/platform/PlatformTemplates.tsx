import React from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
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
      },
      base44: {
        supportedFeatures: ["Built-in Database", "User Authentication", "Instant Deployment"],
        preferredTechStack: ["React" as TechStack, "Node.js" as TechStack],
        deploymentOptions: ["Base44 Cloud"],
        limitations: ["Platform-specific ecosystem"],
        bestPractices: ["Use conversational prompts"],
        promptStyle: "conversational" as const,
        contextPreferences: ["Application lifecycle"],
        outputFormat: "visual" as const
      },
      rork: {
        supportedFeatures: ["React Native", "Expo Toolchain", "Cross-platform"],
        preferredTechStack: ["React Native" as TechStack, "Expo" as TechStack],
        deploymentOptions: ["App Store", "Google Play"],
        limitations: ["Mobile-first only"],
        bestPractices: ["Use mobile-first design"],
        promptStyle: "visual" as const,
        contextPreferences: ["Mobile development"],
        outputFormat: "step-by-step" as const
      },
      v0: {
        supportedFeatures: ["UI Component Generation", "Framework Support"],
        preferredTechStack: ["React" as TechStack, "Vue" as TechStack],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: ["UI-focused only"],
        bestPractices: ["Use natural language prompts"],
        promptStyle: "conversational" as const,
        contextPreferences: ["UI components"],
        outputFormat: "visual" as const
      },
      claudecode: {
        supportedFeatures: ["Security-First", "Terminal Access", "MCP Support"],
        preferredTechStack: ["Python" as TechStack, "TypeScript" as TechStack],
        deploymentOptions: ["Custom", "GitHub Actions"],
        limitations: ["Terminal-based"],
        bestPractices: ["Use granular permissions"],
        promptStyle: "structured" as const,
        contextPreferences: ["Security"],
        outputFormat: "detailed" as const
      },
      geminicli: {
        supportedFeatures: ["ReAct Architecture", "Built-in Tools", "Web Search"],
        preferredTechStack: ["Python" as TechStack, "JavaScript" as TechStack],
        deploymentOptions: ["Self-hosted", "Cloud"],
        limitations: ["Terminal-based"],
        bestPractices: ["Use ReAct patterns"],
        promptStyle: "structured" as const,
        contextPreferences: ["Terminal commands"],
        outputFormat: "step-by-step" as const
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
    },

    // Base44 Templates
    {
      id: "base44-all-in-one",
      name: "All-in-One Business Application",
      description: "Complete business app with built-in database and authentication",
      platform: "base44",
      category: "Business",
      icon: <Cloud className="h-4 w-4" />,
      tags: ["All-in-One", "Built-in DB", "Authentication", "No-Code"],
      spec: {
        targetPlatform: "base44",
        platformSpecificConfig: createDefaultPlatformConfig("base44"),
        projectDescription: "A comprehensive business application built on Base44's all-in-one platform, featuring built-in database, user authentication, and instant deployment capabilities.",
        frontendTechStack: ["React", "TypeScript"],
        backendTechStack: ["Node.js"],
        customFrontendTech: ["Base44 UI Kit"],
        customBackendTech: ["Base44 Database", "Base44 Auth"],
        a2aIntegrationDetails: "Conversational development with AI-powered application generation through natural language prompts.",
        additionalFeatures: "Built-in database, user authentication, instant deployment, GitHub integration, version control, production hosting",
        ragVectorDb: "None",
        customRagVectorDb: "",
        mcpType: "None",
        customMcpType: "",
        advancedPromptDetails: "Build using conversational AI for non-technical users, leverage built-in features for rapid deployment.",
        deploymentPreference: "Base44 Cloud",
        authenticationMethod: "Base44 Auth"
      }
    },

    // Rork Templates
    {
      id: "rork-mobile-app",
      name: "Cross-Platform Mobile Application",
      description: "Native mobile app for iOS and Android with React Native",
      platform: "rork",
      category: "Mobile",
      icon: <Smartphone className="h-4 w-4" />,
      tags: ["Mobile", "React Native", "Cross-platform", "App Store"],
      spec: {
        targetPlatform: "rork",
        platformSpecificConfig: createDefaultPlatformConfig("rork"),
        projectDescription: "A native mobile application built with Rork's React Native platform, optimized for both iOS and Android with cross-platform deployment capabilities.",
        frontendTechStack: ["React Native", "Expo"],
        backendTechStack: [],
        customFrontendTech: ["Expo Router", "React Navigation"],
        customBackendTech: ["Supabase", "Firebase"],
        a2aIntegrationDetails: "Mobile-first development with AI-powered React Native code generation from visual prompts and mockups.",
        additionalFeatures: "Cross-platform compatibility, app store publishing, Expo Go testing, native device features, push notifications",
        ragVectorDb: "None",
        customRagVectorDb: "",
        mcpType: "None",
        customMcpType: "",
        advancedPromptDetails: "Create mobile apps using visual prompts and mockups, leverage React Native ecosystem for cross-platform development.",
        deploymentPreference: "App Store",
        authenticationMethod: "Firebase Auth"
      }
    },

    // V0 Templates
    {
      id: "v0-ui-system",
      name: "Design System & Component Library",
      description: "Beautiful UI components generated from natural language",
      platform: "v0",
      category: "Design System",
      icon: <Palette className="h-4 w-4" />,
      tags: ["UI Components", "Design System", "Multi-framework", "AI-Generated"],
      spec: {
        targetPlatform: "v0",
        platformSpecificConfig: createDefaultPlatformConfig("v0"),
        projectDescription: "A comprehensive design system and component library created with V0's AI-powered UI generation, supporting multiple frameworks and design patterns.",
        frontendTechStack: ["React", "Vue", "Svelte"],
        backendTechStack: [],
        customFrontendTech: ["TailwindCSS", "Radix UI", "Framer Motion"],
        customBackendTech: [],
        a2aIntegrationDetails: "AI-powered UI component generation from natural language descriptions and design mockups with iterative refinement.",
        additionalFeatures: "Multi-framework support, design system tokens, component documentation, accessibility features, responsive design",
        ragVectorDb: "None",
        customRagVectorDb: "",
        mcpType: "None",
        customMcpType: "",
        advancedPromptDetails: "Generate UI components using natural language prompts and design mockups, iterate through conversational interface.",
        deploymentPreference: "Vercel",
        authenticationMethod: "None"
      }
    },

    // Claude Code Templates
    {
      id: "claudecode-secure-app",
      name: "Security-First Enterprise Application",
      description: "Secure application built with Claude's terminal-based development",
      platform: "claudecode",
      category: "Enterprise Security",
      icon: <Code className="h-4 w-4" />,
      tags: ["Security", "Terminal", "Enterprise", "MCP"],
      spec: {
        targetPlatform: "claudecode",
        platformSpecificConfig: createDefaultPlatformConfig("claudecode"),
        projectDescription: "A security-focused enterprise application developed using Claude Code's terminal-based AI agent with granular permissions and advanced security features.",
        frontendTechStack: ["React", "TypeScript"],
        backendTechStack: ["Node.js", "PostgreSQL"],
        customFrontendTech: ["Security Headers", "CSP"],
        customBackendTech: ["JWT", "OAuth2", "Rate Limiting"],
        a2aIntegrationDetails: "Terminal-based development with AI assistance, security-first approach with granular permissions and access control.",
        additionalFeatures: "Advanced security, terminal access, GitHub integration, MCP protocol support, granular permissions, audit logging",
        ragVectorDb: "None",
        customRagVectorDb: "",
        mcpType: "MCP with Tools",
        customMcpType: "",
        advancedPromptDetails: "Develop using terminal-based AI with security-first principles, implement granular permissions and access control.",
        deploymentPreference: "Custom",
        authenticationMethod: "OAuth2"
      }
    },

    // Gemini CLI Templates
    {
      id: "geminicli-automation",
      name: "Terminal Automation & Web Search Tool",
      description: "Powerful automation tool with ReAct architecture and web search",
      platform: "geminicli",
      category: "Automation",
      icon: <Zap className="h-4 w-4" />,
      tags: ["Terminal", "Automation", "Web Search", "Open Source"],
      spec: {
        targetPlatform: "geminicli",
        platformSpecificConfig: createDefaultPlatformConfig("geminicli"),
        projectDescription: "An intelligent automation tool built with Gemini CLI's ReAct architecture, featuring built-in web search, file operations, and terminal command execution.",
        frontendTechStack: [],
        backendTechStack: ["Python", "Node.js"],
        customFrontendTech: [],
        customBackendTech: ["Web Search API", "File System", "Terminal Commands"],
        a2aIntegrationDetails: "ReAct loop architecture for reasoning and acting, with built-in tools for web search, file I/O, and terminal operations.",
        additionalFeatures: "ReAct architecture, web search integration, file operations, terminal commands, open source extensibility, MCP integration",
        ragVectorDb: "None",
        customRagVectorDb: "",
        mcpType: "MCP with Tools",
        customMcpType: "",
        advancedPromptDetails: "Build automation tools using ReAct patterns, leverage built-in tools for web search and file operations.",
        deploymentPreference: "Self-hosted",
        authenticationMethod: "None"
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
      
      <div className="space-y-4">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {template.icon}
                <div>
                  <h3 className="text-sm font-semibold">{template.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {template.category}
                  </Badge>
                </div>
              </div>
            </div>
            
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformTemplates;