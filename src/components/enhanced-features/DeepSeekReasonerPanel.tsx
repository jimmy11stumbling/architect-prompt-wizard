
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Brain, Send, History, Settings, Database, Network, Wrench } from "lucide-react";
import { deepseekReasonerService, ReasonerQuery, ReasonerResponse, ConversationHistory } from "@/services/deepseek/deepseekReasonerService";
import { useToast } from "@/hooks/use-toast";

const DeepSeekReasonerPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ReasonerResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState<Map<string, ConversationHistory[]>>(new Map());
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [integrationSettings, setIntegrationSettings] = useState({
    ragEnabled: true,
    a2aEnabled: true,
    mcpEnabled: true
  });
  const [maxTokens, setMaxTokens] = useState(4096);
  const { toast } = useToast();

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
        maxTokens,
        conversationHistory,
        ragEnabled: integrationSettings.ragEnabled,
        a2aEnabled: integrationSettings.a2aEnabled,
        mcpEnabled: integrationSettings.mcpEnabled
      };

      const result = await deepseekReasonerService.processQuery(reasonerQuery);
      setResponse(result);
      setCurrentConversationId(result.conversationId);
      
      // Update conversations
      const updatedConversations = deepseekReasonerService.getAllConversations();
      setConversations(updatedConversations);

      setQuery(""); // Clear input after successful processing
      
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

  const sampleQueries = [
    "Explain how RAG 2.0 improves upon traditional RAG systems",
    "How does A2A protocol enable multi-agent coordination?",
    "What are the key benefits of MCP integration?",
    "Compare different vector database solutions for RAG",
    "Design a multi-agent system for document analysis"
  ];

  useEffect(() => {
    // Load existing conversations on mount
    const existingConversations = deepseekReasonerService.getAllConversations();
    setConversations(existingConversations);
  }, []);

  return (
    <div className="space-y-6">
      {/* Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            DeepSeek Reasoner Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Your Question or Prompt</Label>
            <Textarea
              id="query"
              placeholder="Ask me anything about AI systems, RAG, A2A protocols, or MCP integration..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={4}
            />
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to submit
            </div>
          </div>

          {/* Integration Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm">RAG 2.0</span>
              </div>
              <Switch
                checked={integrationSettings.ragEnabled}
                onCheckedChange={(checked) => 
                  setIntegrationSettings(prev => ({ ...prev, ragEnabled: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-green-500" />
                <span className="text-sm">A2A Protocol</span>
              </div>
              <Switch
                checked={integrationSettings.a2aEnabled}
                onCheckedChange={(checked) => 
                  setIntegrationSettings(prev => ({ ...prev, a2aEnabled: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-500" />
                <span className="text-sm">MCP Tools</span>
              </div>
              <Switch
                checked={integrationSettings.mcpEnabled}
                onCheckedChange={(checked) => 
                  setIntegrationSettings(prev => ({ ...prev, mcpEnabled: checked }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={processQuery} 
              disabled={isProcessing || !query.trim()}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Processing with Chain-of-Thought...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Process Query
                </>
              )}
            </Button>
            
            {currentConversationId && (
              <Button onClick={clearConversation} variant="outline">
                <History className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            )}
          </div>

          {/* Sample Queries */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Sample Questions:</Label>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(sample)}
                  className="text-xs"
                >
                  {sample}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Display */}
      {response && (
        <Tabs defaultValue="answer" className="w-full">
          <TabsList>
            <TabsTrigger value="answer">Answer</TabsTrigger>
            <TabsTrigger value="reasoning">Chain of Thought</TabsTrigger>
            <TabsTrigger value="integration">Integration Data</TabsTrigger>
            <TabsTrigger value="metrics">Usage Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="answer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  DeepSeek Response
                  <Badge variant="outline">
                    Conversation: {response.conversationId.slice(-8)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{response.answer}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reasoning">
            <Card>
              <CardHeader>
                <CardTitle>Chain-of-Thought Reasoning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {response.reasoning}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>Integration Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {response.integrationData?.ragResults && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      RAG Database Results
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      Retrieved {response.integrationData.ragResults.documents.length} documents:
                    </div>
                    <div className="mt-2 space-y-1">
                      {response.integrationData.ragResults.documents.slice(0, 3).map((doc, index) => (
                        <div key={index} className="text-xs p-2 bg-muted rounded">
                          <strong>{doc.title}</strong> - {doc.source}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {response.integrationData?.a2aMessages && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Network className="h-4 w-4 text-green-500" />
                      A2A Agent Coordination
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {response.integrationData.a2aMessages.length} agent messages exchanged
                    </div>
                  </div>
                )}

                {response.integrationData?.mcpToolCalls && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-orange-500" />
                      MCP Tool Execution
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {response.integrationData.mcpToolCalls.length} tools executed
                    </div>
                    <div className="mt-2 space-y-1">
                      {response.integrationData.mcpToolCalls.map((call, index) => (
                        <div key={index} className="text-xs p-2 bg-muted rounded">
                          <strong>{call.tool}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Usage Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {response.usage.promptTokens.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Prompt Tokens</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {response.usage.completionTokens.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Completion Tokens</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {response.usage.reasoningTokens.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Reasoning Tokens</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {response.usage.totalTokens.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Tokens</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded">
                  <h4 className="font-medium mb-2">Model Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Model:</strong> deepseek-reasoner
                    </div>
                    <div>
                      <strong>Max Context:</strong> 64K tokens
                    </div>
                    <div>
                      <strong>Max Reasoning:</strong> 32K tokens
                    </div>
                    <div>
                      <strong>Max Output:</strong> 8K tokens
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Conversation History */}
      {conversations.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(conversations.entries()).map(([convId, history]) => (
                <div key={convId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Conversation {convId.slice(-8)}</span>
                    <Badge variant="outline">{history.length} messages</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last message: {new Date(history[history.length - 1]?.timestamp || 0).toLocaleString()}
                  </div>
                  <Button
                    onClick={() => setCurrentConversationId(convId)}
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    Continue Conversation
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeepSeekReasonerPanel;
