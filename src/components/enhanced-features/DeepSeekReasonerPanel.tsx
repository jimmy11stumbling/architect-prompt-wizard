
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Brain, Zap, MessageSquare, Settings, Database, Network, Wrench, RefreshCw } from "lucide-react";
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
  
  // Integration settings
  const [ragEnabled, setRagEnabled] = useState(true);
  const [a2aEnabled, setA2aEnabled] = useState(true);
  const [mcpEnabled, setMcpEnabled] = useState(true);
  const [maxTokens, setMaxTokens] = useState(4096);

  useEffect(() => {
    // Initialize the service when component mounts
    deepseekReasonerService.initialize();
  }, []);

  const handleReasonerQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const reasonerQuery: ReasonerQuery = {
        prompt: query,
        maxTokens,
        conversationHistory: conversationId ? 
          deepseekReasonerService.getConversationHistory(conversationId) : 
          undefined,
        ragEnabled,
        a2aEnabled,
        mcpEnabled
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
        reasoning: "Error occurred during processing",
        answer: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        usage: { 
          promptTokens: 0, 
          completionTokens: 0, 
          reasoningTokens: 0,
          totalTokens: 0 
        },
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
            DeepSeek Reasoner with Integrated Communication
            {conversationId && (
              <Badge variant="outline" className="ml-auto">
                Conversation: {conversationId.slice(-8)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Integration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rag-enabled"
                    checked={ragEnabled}
                    onCheckedChange={setRagEnabled}
                  />
                  <Label htmlFor="rag-enabled" className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    RAG 2.0
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="a2a-enabled"
                    checked={a2aEnabled}
                    onCheckedChange={setA2aEnabled}
                  />
                  <Label htmlFor="a2a-enabled" className="flex items-center gap-1">
                    <Network className="h-3 w-3" />
                    A2A Protocol
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mcp-enabled"
                    checked={mcpEnabled}
                    onCheckedChange={setMcpEnabled}
                  />
                  <Label htmlFor="mcp-enabled" className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    MCP Tools
                  </Label>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <Label htmlFor="max-tokens" className="text-sm">Max Tokens:</Label>
                <select
                  id="max-tokens"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value={2048}>2K</option>
                  <option value={4096}>4K</option>
                  <option value={8192}>8K</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Query Input */}
          <div>
            <Textarea
              placeholder="Enter your reasoning query here... (Supports multi-turn conversations with integrated RAG, A2A, and MCP)"
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
              {conversation.length > 0 ? "Continue Reasoning" : "Start Integrated Reasoning"}
            </Button>
            <Button variant="outline" onClick={clearConversation}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>

          {currentResponse?.usage && (
            <div className="flex gap-2 text-sm flex-wrap">
              <Badge variant="outline">
                Input: {currentResponse.usage.promptTokens} tokens
              </Badge>
              <Badge variant="outline">
                Output: {currentResponse.usage.completionTokens} tokens
              </Badge>
              {currentResponse.usage.reasoningTokens > 0 && (
                <Badge variant="outline">
                  Reasoning: {currentResponse.usage.reasoningTokens} tokens
                </Badge>
              )}
              <Badge variant="secondary">
                Total: {currentResponse.usage.totalTokens} tokens
              </Badge>
            </div>
          )}

          {/* Integration Status */}
          {currentResponse?.integrationData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`p-2 rounded ${currentResponse.integrationData.ragResults ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="font-medium">RAG Database</div>
                    <div>{currentResponse.integrationData.ragResults ? 
                      `${currentResponse.integrationData.ragResults.documents?.length || 0} docs` : 
                      'Not used'}</div>
                  </div>
                  <div className={`p-2 rounded ${currentResponse.integrationData.a2aMessages ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="font-medium">A2A Agents</div>
                    <div>{currentResponse.integrationData.a2aMessages ? 
                      `${currentResponse.integrationData.a2aMessages.length} messages` : 
                      'Not used'}</div>
                  </div>
                  <div className={`p-2 rounded ${currentResponse.integrationData.mcpToolCalls ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="font-medium">MCP Tools</div>
                    <div>{currentResponse.integrationData.mcpToolCalls ? 
                      `${currentResponse.integrationData.mcpToolCalls.length} calls` : 
                      'Not used'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {(currentResponse || conversation.length > 0) && (
        <Tabs defaultValue={conversation.length > 1 ? "conversation" : "response"} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="response" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Latest Response
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Chain of Thought
            </TabsTrigger>
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              History ({conversation.length})
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              Integration Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="response">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded max-h-96 overflow-y-auto">
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
                          {turn.response.usage.reasoningTokens > 0 && (
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

          <TabsContent value="integration">
            <div className="space-y-4">
              {currentResponse?.integrationData?.ragResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      RAG Database Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentResponse.integrationData.ragResults.documents?.map((doc: any, index: number) => (
                        <div key={index} className="text-xs border rounded p-2">
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-muted-foreground">{doc.content.substring(0, 100)}...</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentResponse?.integrationData?.a2aMessages && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      A2A Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentResponse.integrationData.a2aMessages.map((msg: any, index: number) => (
                        <div key={index} className="text-xs border rounded p-2">
                          <div className="font-medium">{msg.from} → {msg.to}</div>
                          <div className="text-muted-foreground">{JSON.stringify(msg.payload).substring(0, 100)}...</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentResponse?.integrationData?.mcpToolCalls && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      MCP Tool Calls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentResponse.integrationData.mcpToolCalls.map((call: any, index: number) => (
                        <div key={index} className="text-xs border rounded p-2">
                          <div className="font-medium">Tool: {call.tool}</div>
                          <div className="text-muted-foreground">{JSON.stringify(call.result).substring(0, 100)}...</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!currentResponse?.integrationData && (
                <Card>
                  <CardContent className="text-center py-8">
                    <div className="text-muted-foreground">
                      No integration data available. Make a query with integrations enabled to see detailed results.
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
