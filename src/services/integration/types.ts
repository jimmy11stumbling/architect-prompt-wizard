
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

export interface SystemInitializationConfig {
  ragEnabled?: boolean;
  a2aEnabled?: boolean;
  mcpEnabled?: boolean;
  deepseekEnabled?: boolean;
}
