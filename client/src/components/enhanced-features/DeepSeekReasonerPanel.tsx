import React, { useState, useEffect, useRef } from "react";
import { deepseekReasonerService, ReasonerQuery, ReasonerResponse, ConversationHistory as ConversationHistoryType } from "@/services/deepseek/deepseekReasonerService";
import { DeepSeekStreamingClient, StreamingMessage } from "@/services/deepseek/streamingClient";
import { useToast } from "@/hooks/use-toast";
import QueryInterface from "./deepseek/QueryInterface";
import ResponseTabs from "./deepseek/ResponseTabs";
import ConversationHistory from "./deepseek/ConversationHistory";
import StreamingResponse from "./deepseek/StreamingResponse";

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

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [streamingMode, setStreamingMode] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const streamControllerRef = useRef<AbortController | null>(null);
  const [assetStats, setAssetStats] = useState({ totalAssets: 0, categories: {} });

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
    const fetchRagStats = async () => {
      if (integrationSettings.ragEnabled) {
        try {
          const response = await fetch('/api/rag/stats');
          if (response.ok) {
            const stats = await response.json();
            setRagStats({
              documentsIndexed: stats.documentsIndexed || 0,
              chunksIndexed: stats.chunksIndexed || 0,
              lastUpdated: new Date()
            });
          }
        } catch (error) {
          console.warn('Failed to fetch RAG stats:', error);
        }
      }
    };

    fetchRagStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchRagStats, 30000);
    return () => clearInterval(interval);
  }, [integrationSettings.ragEnabled]);

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

  useEffect(() => {
    const fetchRagStats = async () => {
      if (integrationSettings.ragEnabled) {
        try {
          const response = await fetch('/api/rag/stats');
          if (response.ok) {
            const stats = await response.json();
            setRagStats({
              documentsIndexed: stats.documentsIndexed || 0,
              chunksIndexed: stats.chunksIndexed || 0,
              lastUpdated: new Date()
            });
          }
        } catch (error) {
          console.warn('Failed to fetch RAG stats:', error);
        }
      }
    };

    fetchRagStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchRagStats, 30000);
    return () => clearInterval(interval);
  }, [integrationSettings.ragEnabled]);

  useEffect(() => {
    const existingConversations = deepseekReasonerService.getAllConversations();
    setConversations(existingConversations);
  }, []);

  useEffect(() => {
    const loadAssetStats = async () => {
    try {
      // Assuming attachedAssetsService.getAssetStatistics() returns the stats object
      const stats = {
        totalAssets: 3219, // Replace with actual number of assets
        categories: {
          MCP: 500,
          RAG2: 300,
          A2A: 200,
          Other: 2219
        }
      };
      setAssetStats(stats);
    } catch (error) {
      console.error('Failed to load asset statistics:', error);
      setAssetStats({ totalAssets: 0, categories: {} }); // Reset on error
    }
  };
    loadAssetStats();
  }, []);


  return (
    <div className="space-y-6">
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