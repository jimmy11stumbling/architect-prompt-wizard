import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Code, Palette, Cloud, Bot, Smartphone } from "lucide-react";
import { PlatformType, PlatformConfig } from "@/types/ipa-types";

interface PlatformSelectorProps {
  selectedPlatform: PlatformType;
  onPlatformChange: (platform: PlatformType, config: PlatformConfig) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  selectedPlatform, 
  onPlatformChange 
}) => {
  const [loading, setLoading] = useState(false);

  const handlePlatformSelect = (platformType: PlatformType) => {
    const config = generatePlatformConfig(platformType);
    onPlatformChange(platformType, config);
  };

  const generatePlatformConfig = (platformType: PlatformType): PlatformConfig => {
    const configs: Record<PlatformType, PlatformConfig> = {
      bolt: {
        supportedFeatures: ["WebContainer", "Browser Runtime", "Instant Deploy", "NPM Packages"],
        preferredTechStack: ["React", "TypeScript", "Next.js"],
        deploymentOptions: ["StackBlitz", "Vercel", "Netlify"],
        limitations: ["WebContainer limitations", "Node.js environment constraints"],
        bestPractices: ["Use WebContainer-compatible packages", "Optimize for browser runtime", "Focus on frontend-heavy applications"],
        promptStyle: "code-focused",
        contextPreferences: ["Code examples", "File structure", "Dependency management"],
        outputFormat: "step-by-step"
      },
      cursor: {
        supportedFeatures: ["AI Chat", "Codebase Context", "Code Completion", "Git Integration"],
        preferredTechStack: ["TypeScript", "React", "Node.js", "Python"],
        deploymentOptions: ["Vercel", "Railway", "Render", "Fly.io"],
        limitations: ["Local development focused", "Requires Git integration"],
        bestPractices: ["Use AI chat for complex refactoring", "Leverage codebase context", "Implement proper Git workflow"],
        promptStyle: "conversational",
        contextPreferences: ["Codebase context", "AI assistance", "Code review"],
        outputFormat: "detailed"
      },
      lovable: {
        supportedFeatures: ["Conversational UI", "Visual Design", "Template Generation", "Rapid Prototyping"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Lovable Cloud", "Vercel", "Netlify"],
        limitations: ["Template-based generation", "Limited backend customization"],
        bestPractices: ["Use conversational prompts", "Iterate through chat", "Focus on UI/UX design"],
        promptStyle: "conversational",
        contextPreferences: ["User interface design", "User experience", "Visual components"],
        outputFormat: "visual"
      },
      replit: {
        supportedFeatures: ["Cloud Hosting", "Collaboration", "AI Agent", "Database"],
        preferredTechStack: ["Python", "JavaScript", "React", "Flask", "Express"],
        deploymentOptions: ["Replit Hosting", "Custom domains"],
        limitations: ["Cloud-based environment", "Resource constraints"],
        bestPractices: ["Use Replit AI Agent", "Leverage cloud hosting", "Implement collaborative features"],
        promptStyle: "structured",
        contextPreferences: ["Cloud deployment", "Collaborative development", "Educational context"],
        outputFormat: "step-by-step"
      },
      windsurf: {
        supportedFeatures: ["Agent Workflows", "MCP Protocol", "Database Tools", "AI Coordination"],
        preferredTechStack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        deploymentOptions: ["Railway", "Render", "Fly.io", "Digital Ocean"],
        limitations: ["Agent-based development", "MCP protocol requirements"],
        bestPractices: ["Use agentic workflows", "Implement MCP integrations", "Leverage database tooling"],
        promptStyle: "structured",
        contextPreferences: ["Database development", "Agent coordination", "MCP protocols"],
        outputFormat: "detailed"
      },
      base44: {
        supportedFeatures: ["Built-in Database", "User Authentication", "Instant Deployment", "GitHub Integration"],
        preferredTechStack: ["React", "Node.js", "Built-in DB"],
        deploymentOptions: ["Base44 Cloud", "Custom Hosting"],
        limitations: ["Platform-specific ecosystem", "Limited customization"],
        bestPractices: ["Use conversational prompts", "Leverage built-in features", "Focus on rapid prototyping"],
        promptStyle: "conversational",
        contextPreferences: ["Application lifecycle", "Non-technical users", "Production deployment"],
        outputFormat: "visual"
      },
      rork: {
        supportedFeatures: ["React Native", "Expo Toolchain", "Cross-platform", "App Store Publishing"],
        preferredTechStack: ["React Native", "Expo", "TypeScript"],
        deploymentOptions: ["App Store", "Google Play", "Expo Go"],
        limitations: ["Mobile-first only", "React Native constraints"],
        bestPractices: ["Use mobile-first design", "Leverage Expo ecosystem", "Focus on cross-platform"],
        promptStyle: "visual",
        contextPreferences: ["Mobile development", "Cross-platform", "App publishing"],
        outputFormat: "step-by-step"
      },
      v0: {
        supportedFeatures: ["UI Component Generation", "Framework Support", "Design Mockups", "Iterative Refinement"],
        preferredTechStack: ["React", "Vue", "Svelte", "HTML/CSS"],
        deploymentOptions: ["Vercel", "Netlify", "Custom"],
        limitations: ["UI-focused only", "Component-based approach"],
        bestPractices: ["Use natural language prompts", "Leverage design mockups", "Iterate through chat"],
        promptStyle: "conversational",
        contextPreferences: ["UI components", "Design systems", "Visual elements"],
        outputFormat: "visual"
      },
      claudecode: {
        supportedFeatures: ["Security-First", "Terminal Access", "GitHub Integration", "MCP Support"],
        preferredTechStack: ["Python", "JavaScript", "TypeScript", "Any Language"],
        deploymentOptions: ["Custom", "GitHub Actions", "CI/CD"],
        limitations: ["Terminal-based", "Security restrictions"],
        bestPractices: ["Use granular permissions", "Leverage MCP integrations", "Focus on security"],
        promptStyle: "structured",
        contextPreferences: ["Security", "Terminal operations", "Code generation"],
        outputFormat: "detailed"
      },
      geminicli: {
        supportedFeatures: ["ReAct Architecture", "Built-in Tools", "Web Search", "Open Source"],
        preferredTechStack: ["Python", "JavaScript", "Any Language"],
        deploymentOptions: ["Self-hosted", "Cloud", "Custom"],
        limitations: ["Terminal-based", "Open source dependencies"],
        bestPractices: ["Use ReAct patterns", "Leverage built-in tools", "Extend with MCP"],
        promptStyle: "structured",
        contextPreferences: ["Terminal commands", "Web search", "File operations"],
        outputFormat: "step-by-step"
      }
    };

    return configs[platformType];
  };

  const platformCards = [
    {
      type: "bolt" as PlatformType,
      name: "Bolt (StackBlitz)",
      description: "AI web development in the browser with WebContainer technology",
      icon: <Zap className="h-6 w-6" />,
      category: "AI Development Platform",
      strengths: ["Instant deployment", "Browser-based", "WebContainer", "No setup required"],
      idealFor: "Frontend applications, prototypes, demos"
    },
    {
      type: "cursor" as PlatformType,
      name: "Cursor",
      description: "AI-first code editor with deep AI integration",
      icon: <Code className="h-6 w-6" />,
      category: "AI-First IDE",
      strengths: ["AI chat", "Codebase context", "Code completion", "Git integration"],
      idealFor: "Full-stack development, AI-assisted coding, refactoring"
    },
    {
      type: "lovable" as PlatformType,
      name: "Lovable 2.0",
      description: "Build production apps through conversational AI",
      icon: <Palette className="h-6 w-6" />,
      category: "No-Code AI Platform",
      strengths: ["Conversational UI", "Visual design", "Rapid prototyping", "Template-based"],
      idealFor: "UI/UX focused apps, rapid prototyping, design-first development"
    },
    {
      type: "replit" as PlatformType,
      name: "Replit",
      description: "Cloud IDE with AI Agent for collaborative development",
      icon: <Cloud className="h-6 w-6" />,
      category: "Cloud IDE with AI",
      strengths: ["Cloud hosting", "Collaboration", "AI Agent", "Educational"],
      idealFor: "Learning projects, collaborative development, cloud deployment"
    },
    {
      type: "windsurf" as PlatformType,
      name: "Windsurf (Codeium)",
      description: "Agentic IDE with MCP support for database development",
      icon: <Bot className="h-6 w-6" />,
      category: "Agentic IDE",
      strengths: ["Agent workflows", "MCP protocol", "Database tools", "AI coordination"],
      idealFor: "Database applications, enterprise development, complex workflows"
    },
    {
      type: "base44" as PlatformType,
      name: "Base44",
      description: "All-in-one AI platform for non-technical users to build production apps",
      icon: <Cloud className="h-6 w-6" />,
      category: "All-in-One No-Code",
      strengths: ["Built-in database", "User authentication", "Instant deployment", "GitHub integration"],
      idealFor: "Non-technical users, rapid prototyping, production apps"
    },
    {
      type: "rork" as PlatformType,
      name: "Rork",
      description: "Mobile-first AI platform for native iOS and Android apps",
      icon: <Smartphone className="h-6 w-6" />,
      category: "Mobile-First Platform",
      strengths: ["React Native", "Cross-platform", "App Store publishing", "Expo toolchain"],
      idealFor: "Mobile apps, cross-platform development, app store deployment"
    },
    {
      type: "v0" as PlatformType,
      name: "V0 by Vercel",
      description: "UI component generator from natural language and design mockups",
      icon: <Palette className="h-6 w-6" />,
      category: "UI Component Generator",
      strengths: ["UI generation", "Framework support", "Design mockups", "Iterative refinement"],
      idealFor: "UI components, design systems, rapid prototyping"
    },
    {
      type: "claudecode" as PlatformType,
      name: "Claude Code",
      description: "Security-first terminal CLI tool for agentic coding",
      icon: <Code className="h-6 w-6" />,
      category: "Security-First CLI",
      strengths: ["Security-first", "Terminal access", "GitHub integration", "MCP support"],
      idealFor: "Secure development, terminal workflows, enterprise security"
    },
    {
      type: "geminicli" as PlatformType,
      name: "Gemini CLI",
      description: "Open-source terminal AI agent with ReAct architecture",
      icon: <Zap className="h-6 w-6" />,
      category: "Open-Source Terminal",
      strengths: ["ReAct architecture", "Built-in tools", "Web search", "Open source"],
      idealFor: "Terminal automation, web search, open-source projects"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Choose Your Development Platform
          </CardTitle>
          <CardDescription>
            Select the platform where you'll build your project. Each platform has unique capabilities and optimizations.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Platform Cards</TabsTrigger>
          <TabsTrigger value="dropdown">Quick Select</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformCards.map((platform) => (
              <Card 
                key={platform.type}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlatform === platform.type 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handlePlatformSelect(platform.type)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {platform.icon}
                      <div>
                        <CardTitle className="text-sm">{platform.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {platform.category}
                        </Badge>
                      </div>
                    </div>
                    {selectedPlatform === platform.type && (
                      <Badge variant="default" className="text-xs">Selected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-xs">
                    {platform.description}
                  </CardDescription>

                  <div>
                    <p className="text-xs font-medium mb-1">Key Strengths:</p>
                    <div className="flex flex-wrap gap-1">
                      {platform.strengths.map((strength) => (
                        <Badge key={strength} variant="outline" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Ideal for: {platform.idealFor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dropdown">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Platform:</label>
                  <Select 
                    value={selectedPlatform} 
                    onValueChange={(value) => {
                      console.log(`PlatformSelector: Platform changed to ${value}`);
                      handlePlatformSelect(value as PlatformType)
                    }}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Choose your development platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformCards.map((platform) => (
                        <SelectItem key={platform.type} value={platform.type}>
                          <div className="flex items-center gap-2">
                            {platform.icon}
                            <span>{platform.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto">
                              {platform.category}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlatform && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">
                      {platformCards.find(p => p.type === selectedPlatform)?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {platformCards.find(p => p.type === selectedPlatform)?.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {platformCards.find(p => p.type === selectedPlatform)?.idealFor}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformSelector;