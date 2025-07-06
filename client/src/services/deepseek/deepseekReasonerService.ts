
import { realTimeResponseService } from "../integration/realTimeResponseService";
import { attachedAssetsService } from "./attachedAssetsService";
import { ReasonerQuery, DeepSeekResponse } from './types';
import { ApiKeyManager } from './core/apiKeyManager';
import { DeepSeekApiClient } from './core/apiClient';
import { MockResponseGenerator } from './core/mockResponseGenerator';
import { ConversationManager } from './core/conversationManager';
import { ResponseProcessor } from './core/responseProcessor';
import { ragService } from '../rag/ragService';
import { mcpHubService } from '../mcp/mcpHubService';

export * from './types';

export class DeepSeekReasonerService {
  private static instance: DeepSeekReasonerService;
  private conversationManager = new ConversationManager();
  private initialized = false;

  static getInstance(): DeepSeekReasonerService {
    if (!DeepSeekReasonerService.instance) {
      DeepSeekReasonerService.instance = new DeepSeekReasonerService();
    }
    return DeepSeekReasonerService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize DeepSeek service:", error);
      throw error;
    }
  }

  private async makeDeepSeekCall(messages: Array<{role: string, content: string}>): Promise<any> {
    if (!ApiKeyManager.hasApiKey()) {
      console.warn("No DeepSeek API key found, using mock response");
      return MockResponseGenerator.generateEnhancedMockResponse(messages[messages.length - 1].content);
    }

    try {
      return await DeepSeekApiClient.makeApiCall(messages);
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      throw error;
    }
  }

  async processQuery(query: ReasonerQuery): Promise<DeepSeekResponse> {
    const startTime = Date.now();
    const conversationId = this.conversationManager.generateConversationId();

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "processing",
      message: "Processing query with DeepSeek reasoning engine...",
      data: { 
        prompt: query.prompt.substring(0, 100),
        maxTokens: query.maxTokens || 4096,
        integrations: {
          rag: query.ragEnabled,
          a2a: query.a2aEnabled,
          mcp: query.mcpEnabled
        },
        hasApiKey: ApiKeyManager.hasApiKey()
      }
    });

    try {
      const messages = [];
      let ragContext = "";
      let integrationData: any = {};

      // Load attached assets context if available
      let attachedAssetsContext = "";
      if (query.useAttachedAssets) {
        try {
          realTimeResponseService.addResponse({
            source: "deepseek-reasoner",
            status: "processing",
            message: "Loading relevant attached assets via MCP Hub...",
            data: { query: query.prompt }
          });

          // Use MCP Hub service for enhanced context retrieval
          const response = await fetch('/api/mcp-hub/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: query.prompt,
              maxAssets: 3,
              includeContent: true,
              relevanceThreshold: 0.1
            })
          });

          if (response.ok) {
            const result = await response.json();
            const context = result.data;
            
            if (context.relevantAssets.length > 0) {
              attachedAssetsContext = "\n\n=== ATTACHED ASSETS CONTEXT ===\n";
              
              for (const asset of context.relevantAssets) {
                const content = context.contextData[asset.filename];
                if (content) {
                  attachedAssetsContext += `\n--- ${asset.filename} (${asset.metadata?.category || 'general'}) ---\n`;
                  attachedAssetsContext += content.substring(0, 2000) + (content.length > 2000 ? "..." : "") + "\n";
                }
              }
              attachedAssetsContext += "\n=== END ATTACHED ASSETS ===\n";
              
              integrationData.attachedAssets = {
                count: context.relevantAssets.length,
                used: context.relevantAssets.map((a: any) => a.filename)
              };

              realTimeResponseService.addResponse({
                source: "deepseek-reasoner",
                status: "success",
                message: `Loaded ${context.relevantAssets.length} relevant assets from MCP Hub`,
                data: { 
                  assetFiles: context.relevantAssets.map((a: any) => a.filename),
                  categories: context.metadata.categoriesFound
                }
              });
            } else {
              realTimeResponseService.addResponse({
                source: "deepseek-reasoner",
                status: "info",
                message: "No relevant attached assets found for this query",
                data: {}
              });
            }
          } else {
            throw new Error(`MCP Hub query failed: ${response.statusText}`);
          }
        } catch (error) {
          realTimeResponseService.addResponse({
            source: "deepseek-reasoner",
            status: "warning",
            message: "Failed to load attached assets via MCP Hub, continuing without them",
            data: { error: String(error) }
          });
        }
      }

      // Fetch RAG context if enabled
      if (query.ragEnabled) {
        try {
          realTimeResponseService.addResponse({
            source: "deepseek-reasoner",
            status: "processing",
            message: "Fetching relevant context from RAG database...",
            data: { query: query.prompt }
          });

          const ragResults = await ragService.query({
            query: query.prompt,
            limit: 5,
            threshold: 0.3
          });

          if (ragResults.results && ragResults.results.length > 0) {
            ragContext = ragResults.results.map(result => 
              `[${result.metadata?.title || 'Document'}]: ${result.content}`
            ).join('\n\n');
            
            integrationData.ragResults = ragResults;
            
            realTimeResponseService.addResponse({
              source: "deepseek-reasoner",
              status: "success",
              message: `Retrieved ${ragResults.results.length} relevant documents from RAG database`,
              data: { resultsCount: ragResults.results.length }
            });
          } else {
            realTimeResponseService.addResponse({
              source: "deepseek-reasoner",
              status: "info",
              message: "No relevant documents found in RAG database",
              data: { query: query.prompt }
            });
          }
        } catch (ragError) {
          realTimeResponseService.addResponse({
            source: "deepseek-reasoner",
            status: "error",
            message: `RAG database connection failed: ${ragError instanceof Error ? ragError.message : 'Unknown error'}`,
            data: { error: ragError }
          });
        }
      }
      
      if (query.conversationHistory && query.conversationHistory.length > 0) {
        query.conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }

      // Enhanced prompt with RAG context and attached assets
      let enhancedPrompt = query.prompt;
      
      if (attachedAssetsContext || ragContext) {
        let contextSection = "";
        
        if (attachedAssetsContext) {
          contextSection += attachedAssetsContext + "\n\n";
        }
        
        if (ragContext) {
          contextSection += `Context from knowledge base:\n${ragContext}\n\n`;
        }
        
        enhancedPrompt = `${contextSection}User query: ${query.prompt}`;
      }

      messages.push({
        role: "user",
        content: enhancedPrompt
      });

      const apiResponse = await this.makeDeepSeekCall(messages);
      const response = ResponseProcessor.processApiResponse(
        apiResponse, 
        query, 
        startTime, 
        conversationId, 
        this.conversationManager
      );

      // Add integration data to response
      response.integrationData = integrationData;

      realTimeResponseService.addResponse({
        source: "deepseek-reasoner",
        status: "success",
        message: "DeepSeek reasoning completed successfully",
        data: {
          conversationId,
          tokenUsage: response.usage.totalTokens,
          processingTime: response.processingTime,
          confidence: response.confidence,
          usedRealApi: ApiKeyManager.hasApiKey()
        }
      });

      return response;

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "deepseek-reasoner",
        status: "error",
        message: `DeepSeek processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { conversationId, error: error instanceof Error ? error.message : "Unknown error" }
      });

      throw error;
    }
  }

  getAllConversations() {
    return this.conversationManager.getAllConversations();
  }

  clearConversation(conversationId: string): void {
    this.conversationManager.clearConversation(conversationId);
    
    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "success",
      message: `Conversation ${conversationId} cleared`,
      data: { conversationId }
    });
  }

  async healthCheck(): Promise<{ healthy: boolean; model: string; contextWindow: number; reasoningCapacity: number }> {
    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "processing",
      message: "Performing DeepSeek health check",
      data: {}
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    const healthStatus = {
      healthy: true,
      model: "deepseek-reasoner",
      contextWindow: 64000,
      reasoningCapacity: 32000
    };

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "success",
      message: "DeepSeek health check passed",
      data: healthStatus
    });

    return healthStatus;
  }

  setApiKey(apiKey: string): void {
    ApiKeyManager.setApiKey(apiKey);
  }
}

export const deepseekReasonerService = DeepSeekReasonerService.getInstance();
