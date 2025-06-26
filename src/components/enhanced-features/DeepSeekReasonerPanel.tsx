
import React, { useState, useEffect } from "react";
import { deepseekReasonerService, ReasonerQuery, ReasonerResponse, ConversationHistory as ConversationHistoryType } from "@/services/deepseek/deepseekReasonerService";
import { useToast } from "@/hooks/use-toast";
import QueryInterface from "./deepseek/QueryInterface";
import ResponseTabs from "./deepseek/ResponseTabs";
import ConversationHistory from "./deepseek/ConversationHistory";

const DeepSeekReasonerPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ReasonerResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState<Map<string, ConversationHistoryType[]>>(new Map());
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [integrationSettings, setIntegrationSettings] = useState({
    ragEnabled: true,
    a2aEnabled: true,
    mcpEnabled: true
  });
  const { toast } = useToast();

  const sampleQueries = [
    "Explain how RAG 2.0 improves upon traditional RAG systems",
    "How does A2A protocol enable multi-agent coordination?",
    "What are the key benefits of MCP integration?",
    "Compare different vector database solutions for RAG",
    "Design a multi-agent system for document analysis"
  ];

  const processQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a question or prompt",
        variant: "destructive"
      });
      return;
    }

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
      <QueryInterface
        query={query}
        setQuery={setQuery}
        isProcessing={isProcessing}
        integrationSettings={integrationSettings}
        setIntegrationSettings={setIntegrationSettings}
        onProcessQuery={processQuery}
        onClearConversation={clearConversation}
        currentConversationId={currentConversationId}
        onKeyPress={handleKeyPress}
        sampleQueries={sampleQueries}
      />

      {response && <ResponseTabs response={response} />}

      <ConversationHistory
        conversations={conversations}
        onContinueConversation={handleContinueConversation}
      />
    </div>
  );
};

export default DeepSeekReasonerPanel;
