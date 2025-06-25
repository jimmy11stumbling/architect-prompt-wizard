
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type McpToolRow = Database['public']['Tables']['mcp_tools']['Row'];

export interface McpTool {
  id: string;
  toolName: string;
  toolType: string;
  description?: string;
  configuration: any;
  capabilities: string[];
  supportedFormats: string[];
  isActive: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface McpToolRequest {
  toolName: string;
  operation: string;
  input: any;
  options?: any;
}

export interface McpToolResponse {
  success: boolean;
  result: any;
  metadata: any;
  processingTimeMs: number;
  toolVersion: string;
}

class EnhancedMcpService {
  async getAvailableTools(): Promise<McpTool[]> {
    const { data, error } = await supabase
      .from('mcp_tools')
      .select('*')
      .eq('is_active', true)
      .order('tool_name');

    if (error) throw error;

    return data.map(row => ({
      id: row.id,
      toolName: row.tool_name,
      toolType: row.tool_type,
      description: row.description || undefined,
      configuration: row.configuration || {},
      capabilities: row.capabilities || [],
      supportedFormats: row.supported_formats || [],
      isActive: row.is_active || false,
      version: row.version || '1.0.0',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getToolsByType(toolType: string): Promise<McpTool[]> {
    const tools = await this.getAvailableTools();
    return tools.filter(tool => tool.toolType === toolType);
  }

  async getToolsByCapability(capability: string): Promise<McpTool[]> {
    const tools = await this.getAvailableTools();
    return tools.filter(tool => tool.capabilities.includes(capability));
  }

  async executeTool(request: McpToolRequest): Promise<McpToolResponse> {
    const startTime = Date.now();
    
    try {
      // Call the MCP edge function
      const { data, error } = await supabase.functions.invoke('mcp-executor', {
        body: request
      });

      if (error) throw error;

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        result: data.result,
        metadata: {
          ...data.metadata,
          timestamp: new Date().toISOString(),
          processingTimeMs: processingTime
        },
        processingTimeMs: processingTime,
        toolVersion: data.toolVersion || '1.0.0'
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('MCP tool execution failed:', error);
      
      return {
        success: false,
        result: null,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          processingTimeMs: processingTime
        },
        processingTimeMs: processingTime,
        toolVersion: '1.0.0'
      };
    }
  }

  async analyzeDocument(text: string, format: string = 'txt'): Promise<McpToolResponse> {
    return this.executeTool({
      toolName: 'document_analyzer',
      operation: 'analyze',
      input: { text, format },
      options: { includeStructure: true, includeClassification: true }
    });
  }

  async searchWeb(query: string, maxResults: number = 5): Promise<McpToolResponse> {
    return this.executeTool({
      toolName: 'web_search',
      operation: 'search',
      input: { query, maxResults },
      options: { includeSnippets: true }
    });
  }

  async analyzeCode(code: string, language: string): Promise<McpToolResponse> {
    return this.executeTool({
      toolName: 'code_analyzer',
      operation: 'analyze',
      input: { code, language },
      options: { includeDocumentation: true, includeSuggestions: true }
    });
  }

  async processData(data: any, format: string, operation: string): Promise<McpToolResponse> {
    return this.executeTool({
      toolName: 'data_processor',
      operation,
      input: { data, format },
      options: { outputFormat: 'json' }
    });
  }

  async generateEmbeddings(text: string): Promise<McpToolResponse> {
    return this.executeTool({
      toolName: 'vector_embedder',
      operation: 'embed',
      input: { text },
      options: { normalize: true }
    });
  }

  async summarizeContent(text: string, summaryType: string = 'detailed'): Promise<McpToolResponse> {
    return this.executeTool({
      toolName: 'summarizer',
      operation: 'summarize',
      input: { text, summaryType },
      options: { includeKeyPoints: true }
    });
  }

  async executeMultipleTools(requests: McpToolRequest[]): Promise<McpToolResponse[]> {
    const promises = requests.map(request => this.executeTool(request));
    return Promise.all(promises);
  }

  async getToolCapabilities(toolName: string): Promise<string[]> {
    const tools = await this.getAvailableTools();
    const tool = tools.find(t => t.toolName === toolName);
    return tool?.capabilities || [];
  }

  async getSupportedFormats(toolName: string): Promise<string[]> {
    const tools = await this.getAvailableTools();
    const tool = tools.find(t => t.toolName === toolName);
    return tool?.supportedFormats || [];
  }
}

export const enhancedMcpService = new EnhancedMcpService();
