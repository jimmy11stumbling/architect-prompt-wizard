
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Database, Network, Settings, FileText, MessageSquare, Code, Activity } from "lucide-react";
import { enhancedSystemService, EnhancedQuery, EnhancedResponse } from "@/services/integration/enhancedSystemService";

const EnhancedQueryInterface: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<EnhancedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useRag, setUseRag] = useState(true);
  const [useA2A, setUseA2A] = useState(true);
  const [useMCP, setUseMCP] = useState(true);
  const [realTimeLog, setRealTimeLog] = useState<string[]>([]);

  const executeEnhancedQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setProgress(0);
    setResponse(null);
    setRealTimeLog([]);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const enhancedQuery: EnhancedQuery = {
        query,
        useRag,
        useA2A,
        useMCP,
        conversationId: response?.conversationId
      };

      const result = await enhancedSystemService.processEnhancedQuery(enhancedQuery);
      setResponse(result);
      setRealTimeLog(result.processingLog);
      setProgress(100);
    } catch (error) {
      console.error("Enhanced query failed:", error);
      const errorLog = [`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`];
      setRealTimeLog(errorLog);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const clearSession = () => {
    setQuery("");
    setResponse(null);
    setRealTimeLog([]);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced AI Query Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Enter your complex query here... (RAG, A2A, and MCP will be integrated automatically)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-rag"
                checked={useRag}
                onCheckedChange={setUseRag}
              />
              <Label htmlFor="use-rag" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                RAG 2.0
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="use-a2a"
                checked={useA2A}
                onCheckedChange={setUseA2A}
              />
              <Label htmlFor="use-a2a" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                A2A Protocol
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="use-mcp"
                checked={useMCP}
                onCheckedChange={setUseMCP}
              />
              <Label htmlFor="use-mcp" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                MCP Hub
              </Label>
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing enhanced query...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={executeEnhancedQuery}
              disabled={loading || !query.trim()}
              className="flex-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Process Enhanced Query
            </Button>
            <Button variant="outline" onClick={clearSession}>
              Clear
            </Button>
          </div>

          {realTimeLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Real-time Processing Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto bg-muted p-3 rounded">
                  {realTimeLog.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {response && (
        <Tabs defaultValue="response" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="response" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Response
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Reasoning
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="response">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enhanced Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                    {response.response}
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
                    {response.reasoning || "No reasoning content available"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      RAG Documents ({response.sources.ragDocuments?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {response.sources.ragDocuments?.map((doc, index) => (
                      <div key={index} className="mb-2 p-2 border rounded text-xs">
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-muted-foreground truncate">{doc.content}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      MCP Tools ({response.sources.mcpTools?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {response.sources.mcpTools?.map((tool, index) => (
                      <div key={index} className="mb-2 p-2 border rounded text-xs">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-muted-foreground">{tool.description}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      A2A Agents ({response.sources.a2aAgents?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {response.sources.a2aAgents?.map((agent, index) => (
                      <div key={index} className="mb-2 p-2 border rounded text-xs">
                        <div className="font-medium">{agent.name}</div>
                        <Badge variant="outline" className="mt-1">
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm">RAG Integration</div>
                    <div className="text-xs text-muted-foreground">
                      {response.sources.ragDocuments?.length || 0} docs
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm">A2A Protocol</div>
                    <div className="text-xs text-muted-foreground">
                      {response.sources.a2aAgents?.length || 0} agents
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm">MCP Hub</div>
                    <div className="text-xs text-muted-foreground">
                      {response.sources.mcpTools?.length || 0} tools
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">🧠</div>
                    <div className="text-sm">DeepSeek Reasoner</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {response.conversationId.slice(-8)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedQueryInterface;
