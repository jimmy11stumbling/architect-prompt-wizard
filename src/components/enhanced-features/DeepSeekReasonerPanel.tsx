
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Zap, MessageSquare, Code, History, RefreshCw } from "lucide-react";
import { deepseekReasonerService, ReasonerQuery, ReasonerResponse } from "@/services/deepseek/deepseekReasonerService";

interface ConversationTurn {
  query: string;
  response: ReasonerResponse;
  timestamp: number;
}

const DeepSeekReasonerPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [currentResponse, setCurrentResponse] = useState<ReasonerResponse | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleReasonerQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const reasonerQuery: ReasonerQuery = {
        prompt: query,
        maxTokens: 4096,
        conversationHistory: conversationId ? 
          deepseekReasonerService.getConversationHistory(conversationId) : 
          undefined
      };

      const result = await deepseekReasonerService.processQuery(reasonerQuery);
      
      // Update conversation
      const newTurn: ConversationTurn = {
        query,
        response: result,
        timestamp: Date.now()
      };
      
      setConversation(prev => [...prev, newTurn]);
      setCurrentResponse(result);
      setConversationId(result.conversationId);
      setQuery(""); // Clear query for next turn
      
    } catch (error) {
      console.error("DeepSeek Reasoner error:", error);
      setCurrentResponse({
        reasoning: "",
        answer: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        conversationId: conversationId || "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    if (conversationId) {
      deepseekReasonerService.clearConversation(conversationId);
    }
    setQuery("");
    setCurrentResponse(null);
    setConversation([]);
    setConversationId(null);
  };

  const continueConversation = (prevQuery: string) => {
    setQuery(`Building on "${prevQuery}": `);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            DeepSeek Reasoner Interface
            {conversationId && (
              <Badge variant="outline" className="ml-auto">
                Conversation: {conversationId.slice(-8)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Enter your reasoning query here... (Supports multi-turn conversations)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleReasonerQuery}
              disabled={loading || !query.trim()}
              className="flex-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {conversation.length > 0 ? "Continue Reasoning" : "Start Reasoning"}
            </Button>
            <Button variant="outline" onClick={clearConversation}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>

          {currentResponse?.usage && (
            <div className="flex gap-2 text-sm">
              <Badge variant="outline">
                Input: {currentResponse.usage.promptTokens} tokens
              </Badge>
              <Badge variant="outline">
                Output: {currentResponse.usage.completionTokens} tokens
              </Badge>
              {currentResponse.usage.reasoningTokens && (
                <Badge variant="outline">
                  Reasoning: {currentResponse.usage.reasoningTokens} tokens
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {(currentResponse || conversation.length > 0) && (
        <Tabs defaultValue={conversation.length > 1 ? "conversation" : "response"} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="response" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Latest Response
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Chain of Thought
            </TabsTrigger>
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Conversation ({conversation.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="response">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                    {currentResponse?.answer || "No response yet"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reasoning">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chain of Thought Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded max-h-96 overflow-y-auto">
                    {currentResponse?.reasoning || "No reasoning content available"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversation">
            <div className="space-y-4">
              {conversation.map((turn, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Turn {index + 1} - {new Date(turn.timestamp).toLocaleTimeString()}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => continueConversation(turn.query)}
                      >
                        Continue from here
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Query:</div>
                        <div className="text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded">
                          {turn.query}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Response:</div>
                        <div className="text-sm bg-green-50 dark:bg-green-950 p-2 rounded max-h-32 overflow-y-auto">
                          {turn.response.answer}
                        </div>
                      </div>
                      {turn.response.usage && (
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">
                            {turn.response.usage.totalTokens} tokens
                          </Badge>
                          {turn.response.usage.reasoningTokens && (
                            <Badge variant="secondary">
                              {turn.response.usage.reasoningTokens} reasoning
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {conversation.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <div className="text-muted-foreground">
                      No conversation history yet. Start a reasoning session to see the conversation flow.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DeepSeekReasonerPanel;
