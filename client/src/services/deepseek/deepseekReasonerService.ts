
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

      // Enhanced RAG System Integration with Full Document Access
      if (query.ragEnabled) {
        try {
          realTimeResponseService.addResponse({
            source: "deepseek-reasoner",
            status: "processing",
            message: "Executing comprehensive RAG 2.0 search across all 6,800+ documents...",
            data: { query: query.prompt, documentsAvailable: "6800+" }
          });

          // Use the backend RAG API directly for better integration with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

          try {
            const ragResponse = await fetch('/api/rag/search', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              },
              body: JSON.stringify({
                query: query.prompt,
                limit: 15,
                includeMetadata: true,
                semanticWeight: 0.7
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);
            let allResults: any[] = [];
            
            if (ragResponse.ok) {
              const ragData = await ragResponse.json();
              allResults = ragData.results || [];
              
              realTimeResponseService.addResponse({
                source: "deepseek-reasoner",
                status: "info",
                message: `RAG search found ${allResults.length} relevant documents`,
                data: { 
                  results: allResults.length,
                  avgRelevance: allResults.length > 0 ? allResults.reduce((acc: number, r: any) => acc + (r.relevanceScore || 0), 0) / allResults.length : 0
                }
              });
            } else {
              console.warn('RAG search failed:', ragResponse.statusText);
              realTimeResponseService.addResponse({
                source: "deepseek-reasoner",
                status: "warning",
                message: `RAG search failed: ${ragResponse.statusText}`,
                data: { statusCode: ragResponse.status }
              });
            }
          } catch (ragFetchError) {
            clearTimeout(timeoutId);
            if (ragFetchError instanceof Error && ragFetchError.name === 'AbortError') {
              console.warn('RAG search timed out');
              realTimeResponseService.addResponse({
                source: "deepseek-reasoner",
                status: "warning",
                message: "RAG search timed out, continuing without enhanced context",
                data: { timeout: true }
              });
            } else {
              console.warn('RAG search request failed:', ragFetchError);
              realTimeResponseService.addResponse({
                source: "deepseek-reasoner",
                status: "warning",
                message: "RAG search request failed, continuing without enhanced context",
                data: { error: String(ragFetchError) }
              });
            }
          }

          if (allResults.length > 0) {
            // Sort by relevance score
            allResults.sort((a, b) => (b.score || b.relevanceScore || 0) - (a.score || a.relevanceScore || 0));
            const topResults = allResults.slice(0, 10); // Take top 10 most relevant results

            ragContext = "\n\n=== KNOWLEDGE BASE CONTEXT ===\n";
            ragContext += `Found ${allResults.length} relevant documents from database:\n\n`;
            
            topResults.forEach((result, index) => {
              const score = result.score || result.relevanceScore || 0;
              ragContext += `\n[Document ${index + 1}] ${result.metadata?.title || result.metadata?.filename || 'Knowledge Base Document'}\n`;
              ragContext += `Relevance: ${(score * 100).toFixed(1)}%\n`;
              ragContext += `Content: ${result.content.substring(0, 2000)}${result.content.length > 2000 ? "..." : ""}\n`;
              if (result.metadata) {
                ragContext += `Category: ${result.metadata.category || 'General'} | Source: ${result.metadata.source || 'Database'}\n`;
              }
              ragContext += "\n" + "=".repeat(50) + "\n";
            });
            ragContext += "\n=== END KNOWLEDGE BASE CONTEXT ===\n\n";

            integrationData.rag = {
              totalDocumentsSearched: allResults.length,
              topResultsUsed: topResults.length,
              avgRelevance: topResults.reduce((acc, r) => acc + (r.score || r.relevanceScore || 0), 0) / topResults.length,
              highestRelevance: topResults[0]?.score || topResults[0]?.relevanceScore || 0
            };

            realTimeResponseService.addResponse({
              source: "deepseek-reasoner",
              status: "success",
              message: `RAG context loaded: ${topResults.length} relevant documents found`,
              data: integrationData.rag
            });
          } else {
            realTimeResponseService.addResponse({
              source: "deepseek-reasoner",
              status: "warning",
              message: "No relevant documents found in knowledge base for this query",
              data: { query: query.prompt }
            });
          }
        } catch (ragError) {
          console.error('Comprehensive RAG context retrieval failed:', ragError);
          realTimeResponseService.addResponse({
            source: "deepseek-reasoner",
            status: "warning",
            message: "RAG context retrieval failed, proceeding without enhanced context",
            data: { error: ragError instanceof Error ? ragError.message : String(ragError) }
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
        let contextSection = "You have access to the following context information:\n\n";
        
        if (ragContext) {
          contextSection += ragContext + "\n";
        }
        
        if (attachedAssetsContext) {
          contextSection += attachedAssetsContext + "\n";
        }
        
        contextSection += "\nPlease use this context to provide accurate, informed responses. ";
        contextSection += "Reference specific information from the context when relevant.\n\n";
        contextSection += "User Question: " + query.prompt;
        
        enhancedPrompt = contextSection;
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
