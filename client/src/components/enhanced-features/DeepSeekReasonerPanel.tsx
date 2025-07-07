import React, { useState, useEffect, useRef } from "react";
import { deepseekReasonerService, ReasonerQuery, ReasonerResponse, ConversationHistory as ConversationHistoryType } from "@/services/deepseek/deepseekReasonerService";
import { DeepSeekStreamingClient, StreamingMessage } from "@/services/deepseek/streamingClient";
import { useToast } from "@/hooks/use-toast";
import QueryInterface from "./deepseek/QueryInterface";
import ResponseTabs from "./deepseek/ResponseTabs";
import ConversationHistory from "./deepseek/ConversationHistory";
import StreamingResponse from "./deepseek/StreamingResponse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Network } from "lucide-react";

const DeepSeekReasonerPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ReasonerResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState<Map<string, ConversationHistoryType[]>>(new Map());
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [integrationSettings, setIntegrationSettings] = useState({
    ragEnabled: true,
    a2aEnabled: true,
    mcpEnabled: true,
    useAttachedAssets: true
  });

  // RAG Statistics state
  const [ragStats, setRagStats] = useState({
    documentsIndexed: 0,
    chunksIndexed: 0,
    lastUpdated: null
  });

  // Connection Status state
  const [connectionStatus, setConnectionStatus] = useState({
    rag: 'checking',
    api: 'checking',
    deepseek: 'checking'
  });

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [streamingMode, setStreamingMode] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const streamControllerRef = useRef<AbortController | null>(null);

  const { toast } = useToast();

  const sampleQueries = [
    "Explain how RAG 2.0 improves upon traditional RAG systems",
    "How does A2A protocol enable multi-agent coordination?", 
    "What are the key benefits of MCP integration?",
    "Compare different vector database solutions for RAG",
    "Design a multi-agent system for document analysis"
  ];

  // Fetch RAG statistics on component mount and when RAG is enabled
  useEffect(() => {
    const checkConnectivity = async () => {
      // Check RAG connectivity
      try {
        const response = await fetch('/api/rag/stats', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();
        setRagStats({
          documentsIndexed: stats.documentsIndexed || 0,
          chunksIndexed: stats.chunksIndexed || 0,
          lastUpdated: new Date()
        });
        setConnectionStatus(prev => ({ ...prev, rag: 'connected' }));
      } catch (error) {
        console.warn('Failed to get RAG stats:', error instanceof Error ? error.message : 'Unknown error');
        setConnectionStatus(prev => ({ ...prev, rag: 'disconnected' }));
      }

      // Check API connectivity
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        setConnectionStatus(prev => ({ ...prev, api: response.ok ? 'connected' : 'disconnected' }));
      } catch (error) {
        setConnectionStatus(prev => ({ ...prev, api: 'disconnected' }));
      }

      // Check DeepSeek service
      try {
        const health = await deepseekReasonerService.healthCheck();
        setConnectionStatus(prev => ({ ...prev, deepseek: health.healthy ? 'connected' : 'error' }));
      } catch (error) {
        setConnectionStatus(prev => ({ ...prev, deepseek: 'disconnected' }));
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const processQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a question or prompt",
        variant: "destructive"
      });
      return;
    }

    if (streamingMode) {
      await processStreamingQuery();
    } else {
      await processRegularQuery();
    }
  };

  const processStreamingQuery = async () => {
    setIsStreaming(true);
    setIsProcessing(true);
    setStreamingResponse("");
    setStreamingReasoning("");
    setTokenCount(0);
    setIsPaused(false);

    // Create abort controller for stream control
    streamControllerRef.current = new AbortController();

    try {
      const conversationHistory = currentConversationId 
        ? conversations.get(currentConversationId) || []
        : [];

      // Build messages array for streaming
      const messages: StreamingMessage[] = [
        {
          role: "system",
          content: "You are an advanced AI reasoning assistant. Provide detailed chain-of-thought reasoning for complex queries."
        },
        ...conversationHistory.map(h => ({
          role: h.role as "user" | "assistant",
          content: h.content
        })),
        {
          role: "user",
          content: query.trim()
        }
      ];

      await DeepSeekStreamingClient.streamReasonerResponse(messages, {
        temperature: 0.7,
        maxTokens: 4096,
        onToken: (token: string) => {
          if (!isPaused) {
            setStreamingResponse(prev => prev + token);
            setTokenCount(prev => prev + 1);
          }
        },
        onReasoningToken: (token: string) => {
          if (!isPaused) {
            setStreamingReasoning(prev => prev + token);
            setTokenCount(prev => prev + 1);
          }
        },
        onComplete: (fullResponse: string, reasoning?: string) => {
          setIsStreaming(false);
          setIsProcessing(false);

          // Save to conversation history
          const newConversationId = currentConversationId || `conv-${Date.now()}`;
          setCurrentConversationId(newConversationId);

          // Create response object
          const result: ReasonerResponse = {
            answer: fullResponse,
            reasoning: reasoning || "",
            conversationId: newConversationId,
            usage: {
              promptTokens: 0,
              completionTokens: tokenCount,
              reasoningTokens: reasoning?.length || 0,
              totalTokens: tokenCount
            }
          };

          setResponse(result);
          setQuery("");

          toast({
            title: "Streaming Complete",
            description: `Response generated with ${tokenCount} tokens`
          });
        },
        onError: (error: Error) => {
          setIsStreaming(false);
          setIsProcessing(false);

          toast({
            title: "Streaming Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      });

    } catch (error) {
      setIsStreaming(false);
      setIsProcessing(false);

      console.error("Streaming failed:", error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const processRegularQuery = async () => {
    setIsProcessing(true);
    try {
      const conversationHistory = currentConversationId 
        ? conversations.get(currentConversationId) || []
        : [];

      const reasonerQuery: ReasonerQuery = {
        prompt: query.trim(),
        maxTokens: 4096,
        conversationHistory,
        ragEnabled: integrationSettings.ragEnabled,
        a2aEnabled: integrationSettings.a2aEnabled,
        mcpEnabled: integrationSettings.mcpEnabled
      };

      const result = await deepseekReasonerService.processQuery(reasonerQuery);
      setResponse(result);
      setCurrentConversationId(result.conversationId);

      const updatedConversations = deepseekReasonerService.getAllConversations();
      setConversations(updatedConversations);

      setQuery("");

      toast({
        title: "Processing Complete",
        description: `Response generated with ${result.usage.totalTokens} tokens`
      });
    } catch (error) {
      console.error("DeepSeek processing failed:", error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopStream = () => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
    }
    setIsStreaming(false);
    setIsProcessing(false);

    toast({
      title: "Stream Stopped",
      description: "Streaming has been interrupted"
    });
  };

  const handlePauseStream = () => {
    setIsPaused(true);
    toast({
      title: "Stream Paused",
      description: "Streaming has been paused"
    });
  };

  const handleResumeStream = () => {
    setIsPaused(false);
    toast({
      title: "Stream Resumed",
      description: "Streaming has been resumed"
    });
  };

  const clearConversation = () => {
    if (currentConversationId) {
      deepseekReasonerService.clearConversation(currentConversationId);
      setConversations(deepseekReasonerService.getAllConversations());
      setCurrentConversationId(null);
      setResponse(null);

      toast({
        title: "Conversation Cleared",
        description: "Started a new conversation"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      processQuery();
    }
  };

  const handleContinueConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  useEffect(() => {
    const existingConversations = deepseekReasonerService.getAllConversations();
    setConversations(existingConversations);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Knowledge Base
                <div className={`ml-auto w-2 h-2 rounded-full ${connectionStatus.rag === 'connected' ? 'bg-green-500' : connectionStatus.rag === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {ragStats.documentsIndexed.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Documents indexed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Network className="h-4 w-4 mr-2" />
                API Status
                <div className={`ml-auto w-2 h-2 rounded-full ${connectionStatus.api === 'connected' ? 'bg-green-500' : connectionStatus.api === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {connectionStatus.api === 'connected' ? 'Online' : connectionStatus.api === 'disconnected' ? 'Offline' : 'Checking...'}
              </div>
              <p className="text-xs text-muted-foreground">Backend connectivity</p>
            </CardContent>
          </Card>
      </div>
      <QueryInterface
        query={query}
        setQuery={setQuery}
        isProcessing={isProcessing}
        integrationSettings={integrationSettings}
        onIntegrationSettingsChange={setIntegrationSettings}
        onProcessQuery={processQuery}
        onClearConversation={clearConversation}
        onContinueConversation={handleContinueConversation}
        currentConversationId={currentConversationId}
        onKeyPress={handleKeyPress}
        sampleQueries={sampleQueries}
        streamingMode={streamingMode}
        onStreamingModeChange={setStreamingMode}
        isStreaming={isStreaming}
        ragStats={ragStats}
      />

      {/* Streaming Response Display */}
      {streamingMode && (isStreaming || streamingResponse) && (
        <StreamingResponse
          isStreaming={isStreaming}
          response={streamingResponse}
          reasoning={streamingReasoning}
          onStop={handleStopStream}
          onPause={handlePauseStream}
          onResume={handleResumeStream}
          isPaused={isPaused}
          tokenCount={tokenCount}
          estimatedTotal={4096}
        />
      )}

      {/* Regular Response Display */}
      {!streamingMode && response && (
        <ResponseTabs response={response} />
      )}

      {/* Conversation History */}
      {conversations.size > 0 && (
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleContinueConversation}
        />
      )}
    </div>
  );
};

export default DeepSeekReasonerPanel;