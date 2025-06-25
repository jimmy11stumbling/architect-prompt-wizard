
export interface IntegratedQueryRequest {
  query: string;
  enableRAG?: boolean;
  enableA2A?: boolean;
  enableMCP?: boolean;
  enableDeepSeek?: boolean;
  context?: Record<string, any>;
}

export interface IntegratedQueryResponse {
  query: string;
  ragResults?: any;
  a2aCoordination?: any;
  mcpResults?: any;
  reasoning?: any;
  finalResponse: string;
  processingTime: number;
  integrationSummary: {
    servicesUsed: string[];
    totalSteps: number;
    successRate: number;
  };
}

export interface SystemInitializationConfig {
  projectDescription: string;
  frontendTechStack: string[];
  backendTechStack: string[];
  customFrontendTech: string[];
  customBackendTech: string[];
  a2aIntegrationDetails: string;
  additionalFeatures: string;
  ragVectorDb: string;
  customRagVectorDb: string;
  mcpType: string;
  customMcpType: string;
  advancedPromptDetails: string;
}

export interface SystemHealthStatus {
  overallHealth: boolean;
  serviceHealth: {
    rag: boolean;
    a2a: boolean;
    mcp: boolean;
    deepseek: boolean;
  };
  details: {
    ragDocuments: number;
    a2aAgents: number;
    mcpServers: number;
    lastHealthCheck: number;
  };
}
