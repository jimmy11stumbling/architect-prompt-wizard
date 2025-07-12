import { PlatformType, PlatformConfig } from "@/types/ipa-types";

export interface Platform {
  id: number;
  name: string;
  description: string;
  category: string;
  website: string;
}

export interface PlatformFeature {
  id: number;
  platformId: number;
  featureName: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface PlatformIntegration {
  id: number;
  platformId: number;
  serviceName: string;
  serviceType: string;
  integrationDetails: string;
  isNative: boolean;
}

export interface PlatformPricing {
  id: number;
  platformId: number;
  planName: string;
  pricePerMonth: string;
  features: string[];
}

class PlatformService {
  private baseUrl = '/api';

  async getAllPlatforms(): Promise<Platform[]> {
    const response = await fetch(`${this.baseUrl}/platforms`);
    if (!response.ok) throw new Error('Failed to fetch platforms');
    return response.json();
  }

  async getPlatformFeatures(platformId: number): Promise<PlatformFeature[]> {
    const response = await fetch(`${this.baseUrl}/platforms/${platformId}/features`);
    if (!response.ok) throw new Error('Failed to fetch platform features');
    return response.json();
  }

  async getPlatformIntegrations(platformId: number): Promise<PlatformIntegration[]> {
    const response = await fetch(`${this.baseUrl}/platforms/${platformId}/integrations`);
    if (!response.ok) throw new Error('Failed to fetch platform integrations');
    return response.json();
  }

  async getPlatformPricing(platformId: number): Promise<PlatformPricing[]> {
    const response = await fetch(`${this.baseUrl}/platforms/${platformId}/pricing`);
    if (!response.ok) throw new Error('Failed to fetch platform pricing');
    return response.json();
  }

  // Generate platform-specific configuration based on database data
  async generatePlatformConfig(platformType: PlatformType): Promise<PlatformConfig> {
    const platforms = await this.getAllPlatforms();
    const platform = platforms.find(p => this.mapPlatformName(p.name) === platformType);
    
    if (!platform) {
      throw new Error(`Platform ${platformType} not found`);
    }

    const [features, integrations] = await Promise.all([
      this.getPlatformFeatures(platform.id),
      this.getPlatformIntegrations(platform.id)
    ]);

    return this.createPlatformConfig(platformType, features, integrations);
  }

  private mapPlatformName(dbName: string): PlatformType {
    const mapping: Record<string, PlatformType> = {
      'Bolt (StackBlitz)': 'bolt',
      'Cursor': 'cursor',
      'Lovable 2.0': 'lovable',
      'Replit': 'replit',
      'Windsurf (Codeium)': 'windsurf',
      'Base44': 'base44',
      'Rork': 'rork',
      'V0 by Vercel': 'v0',
      'Claude Code': 'claudecode',
      'Gemini CLI': 'geminicli'
    };
    return mapping[dbName] || 'cursor';
  }

  private createPlatformConfig(platformType: PlatformType, features: PlatformFeature[], integrations: PlatformIntegration[]): PlatformConfig {
    const configs: Record<PlatformType, PlatformConfig> = {
      bolt: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vite"],
        deploymentOptions: ["StackBlitz", "Vercel", "Netlify"],
        limitations: ["WebContainer limitations", "Node.js environment constraints"],
        bestPractices: ["Use WebContainer-compatible packages", "Optimize for browser runtime", "Focus on frontend-heavy applications"],
        promptStyle: "code-focused",
        contextPreferences: ["Code examples", "File structure", "Dependency management"],
        outputFormat: "step-by-step"
      },
      cursor: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["TypeScript", "React", "Node.js", "Python", "Go"],
        deploymentOptions: integrations.filter(i => i.serviceType === 'deployment').map(i => i.serviceName),
        limitations: ["Local development focused", "Requires Git integration"],
        bestPractices: ["Use AI chat for complex refactoring", "Leverage codebase context", "Implement proper Git workflow"],
        promptStyle: "conversational",
        contextPreferences: ["Codebase context", "AI assistance", "Code review"],
        outputFormat: "detailed"
      },
      lovable: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["React", "TypeScript", "Supabase", "Tailwind CSS"],
        deploymentOptions: ["Lovable Cloud", "Vercel", "Netlify"],
        limitations: ["Template-based generation", "Limited backend customization"],
        bestPractices: ["Use conversational prompts", "Iterate through chat", "Focus on UI/UX design"],
        promptStyle: "conversational",
        contextPreferences: ["User interface design", "User experience", "Visual components"],
        outputFormat: "visual"
      },
      replit: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["Python", "JavaScript", "React", "Flask", "Express"],
        deploymentOptions: ["Replit Hosting", "Custom domains"],
        limitations: ["Cloud-based environment", "Resource constraints"],
        bestPractices: ["Use Replit AI Agent", "Leverage cloud hosting", "Implement collaborative features"],
        promptStyle: "structured",
        contextPreferences: ["Cloud deployment", "Collaborative development", "Educational context"],
        outputFormat: "step-by-step"
      },
      windsurf: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["TypeScript", "React", "Node.js", "PostgreSQL", "Python"],
        deploymentOptions: integrations.filter(i => i.serviceType === 'deployment').map(i => i.serviceName),
        limitations: ["Agent-based development", "MCP protocol requirements"],
        bestPractices: ["Use agentic workflows", "Implement MCP integrations", "Leverage database tooling"],
        promptStyle: "structured",
        contextPreferences: ["Database development", "Agent coordination", "MCP protocols"],
        outputFormat: "detailed"
      },
      base44: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["React", "Node.js", "Built-in Database"],
        deploymentOptions: ["Base44 Cloud", "Custom Hosting"],
        limitations: ["Platform-specific ecosystem", "Limited customization"],
        bestPractices: ["Use conversational prompts", "Leverage built-in features", "Focus on rapid deployment"],
        promptStyle: "conversational",
        contextPreferences: ["Application lifecycle", "Non-technical users", "Production deployment"],
        outputFormat: "visual"
      },
      rork: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["React Native", "Expo", "TypeScript"],
        deploymentOptions: ["App Store", "Google Play", "Expo Go"],
        limitations: ["Mobile-first only", "React Native constraints"],
        bestPractices: ["Use mobile-first design", "Leverage Expo ecosystem", "Focus on cross-platform"],
        promptStyle: "visual",
        contextPreferences: ["Mobile development", "Cross-platform", "App publishing"],
        outputFormat: "step-by-step"
      },
      v0: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["React", "Vue", "Svelte", "HTML/CSS"],
        deploymentOptions: ["Vercel", "Netlify", "Custom"],
        limitations: ["UI-focused only", "Component-based approach"],
        bestPractices: ["Use natural language prompts", "Leverage design mockups", "Iterate through chat"],
        promptStyle: "conversational",
        contextPreferences: ["UI components", "Design systems", "Visual elements"],
        outputFormat: "visual"
      },
      claudecode: {
        supportedFeatures: features.map(f => f.featureName),
        preferredTechStack: ["Python", "JavaScript", "TypeScript", "Any Language"],
        deploymentOptions: ["Custom", "GitHub Actions", "CI/CD"],
        limitations: ["Terminal-based", "Security restrictions"],
        bestPractices: ["Use granular permissions", "Leverage MCP integrations", "Focus on security"],
        promptStyle: "structured",
        contextPreferences: ["Security", "Terminal operations", "Code generation"],
        outputFormat: "detailed"
      },
      geminicli: {
        supportedFeatures: features.map(f => f.featureName),
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
  }

  // Get platform-specific prompt templates
  getPlatformPromptTemplate(platformType: PlatformType): string {
    const templates: Record<PlatformType, string> = {
      bolt: `Create a web application optimized for StackBlitz's WebContainer environment. Focus on:
- Frontend-heavy architecture with minimal backend dependencies
- WebContainer-compatible packages and APIs
- Browser-based runtime optimization
- Instant deployment capabilities`,

      cursor: `Develop using Cursor's AI-first approach with emphasis on:
- Intelligent code completion and AI assistance
- Codebase-aware development practices
- Git integration and version control
- AI-powered code review and refactoring`,

      lovable: `Build using Lovable's conversational AI platform focusing on:
- User-centric design and experience
- Rapid prototyping through natural language
- Template-based architecture patterns
- Visual-first development approach`,

      replit: `Create for Replit's cloud development environment with:
- Cloud-native architecture and deployment
- Collaborative development features
- Educational and learning-focused design
- Resource-efficient implementation`,

      windsurf: `Develop using Windsurf's agentic IDE capabilities including:
- Multi-agent development workflows
- Model Context Protocol (MCP) integrations
- Database-centric development patterns
- Advanced AI coordination and automation`,

      base44: `Build using Base44's all-in-one platform focusing on:
- Built-in database and authentication systems
- Non-technical user accessibility
- Rapid application deployment
- Conversational AI development interface`,

      rork: `Create mobile applications using Rork's platform with:
- React Native and Expo toolchain
- Cross-platform iOS and Android development
- App Store publishing capabilities
- Visual and text prompt support`,

      v0: `Generate UI components using V0's system featuring:
- Natural language to UI component conversion
- Multi-framework support (React, Vue, Svelte)
- Design mockup interpretation
- Iterative refinement through chat`,

      claudecode: `Develop using Claude Code's security-first approach with:
- Terminal-based AI assistance
- Granular permissions and access control
- GitHub and database orchestration
- Model Context Protocol integrations`,

      geminicli: `Build automation tools using Gemini CLI's capabilities including:
- ReAct loop architecture for reasoning and acting
- Built-in tools for web search and file operations
- Terminal command execution
- Open-source extensibility via MCP`
    };

    return templates[platformType];
  }
}

export const platformService = new PlatformService();