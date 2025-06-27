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
      'Windsurf (Codeium)': 'windsurf'
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
- Advanced AI coordination and automation`
    };

    return templates[platformType];
  }
}

export const platformService = new PlatformService();