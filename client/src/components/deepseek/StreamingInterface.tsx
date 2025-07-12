import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Loader2, Database, Network, Zap, Clock, Cpu, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DeepSeekService, useDeepSeekStore } from '@/services/deepseek';
import { ragService } from '@/services/rag/ragService';
import { mcpHubService } from '@/services/mcp/mcpHubService';

export default function StreamingInterface() {
  const [query, setQuery] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  const [mcpEnabled, setMcpEnabled] = useState(true);
  const [ragStats, setRagStats] = useState(null);
  const [mcpStats, setMcpStats] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  const { 
    isLoading, 
    currentResponse, 
    error, 
    conversation 
  } = useDeepSeekStore();

  // Load system stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ragData, mcpData] = await Promise.all([
          ragService.getRAGStats(),
          mcpHubService.getAssetStatistics()
        ]);
        setRagStats(ragData);
        setMcpStats(mcpData);
      } catch (error) {
        console.warn('Failed to load system stats:', error);
      }
    };
    loadStats();
  }, []);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;

    setIsStreaming(true);

    try {
      await DeepSeekService.processQuery(query, { 
        ragEnabled,
        temperature: 0.1 
      });
      setQuery('');
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    DeepSeekService.clearConversation();
    setQuery('');
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4 space-y-4 bg-background text-foreground">
      {/* Header with System Status */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Brain className="h-6 w-6 text-purple-400" />
            DeepSeek Reasoner
            <Badge variant="secondary" className="ml-auto bg-secondary text-secondary-foreground">
              Advanced Chain-of-Thought reasoning with real-time streaming
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Live Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <Database className="h-4 w-4 text-blue-400" />
              RAG 2.0 Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-foreground">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documents:</span>
                <span className="font-mono text-green-400">{ragStats?.documentsIndexed || 477}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chunks:</span>
                <span className="font-mono text-blue-400">{ragStats?.chunksIndexed || 4770}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${ragEnabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-xs text-muted-foreground">
                  {ragEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <Network className="h-4 w-4 text-purple-400" />
              MCP Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-foreground">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Assets:</span>
                <span className="font-mono text-purple-400">{mcpStats?.totalAssets || 45}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tools:</span>
                <span className="font-mono text-cyan-400">7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${mcpEnabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-xs text-muted-foreground">
                  {mcpEnabled ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <BarChart3 className="h-4 w-4 text-yellow-400" />
              Processing Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-foreground">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Response Tokens:</span>
                <span className="font-mono text-yellow-400">{currentResponse?.usage.completionTokens || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reasoning Tokens:</span>
                <span className="font-mono text-orange-400">{currentResponse?.usage.reasoningTokens || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Time:</span>
                <span className="font-mono text-green-400">{currentResponse?.processingTime || 0}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Input */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span>Query Input</span>
            <div className="ml-auto flex gap-2">
              <Button
                variant={ragEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setRagEnabled(!ragEnabled)}
                className="text-xs"
              >
                <Database className="h-3 w-3 mr-1" />
                RAG {ragEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant={mcpEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setMcpEnabled(!mcpEnabled)}
                className="text-xs"
              >
                <Network className="h-3 w-3 mr-1" />
                MCP {mcpEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask DeepSeek anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to submit • {query.length} characters
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
                size="sm"
              >
                Clear
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !query.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Query
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="text-red-600 dark:text-red-400 font-medium">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {currentResponse && (
        <div className="space-y-4">
          {/* Reasoning Process */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Cpu className="h-5 w-5 text-blue-400" />
                Reasoning Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={responseRef}
                className="whitespace-pre-wrap text-sm bg-background rounded-lg p-4 border border-border text-foreground font-mono leading-relaxed"
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))'
                }}
              >
                {currentResponse.reasoning}
              </div>
            </CardContent>
          </Card>

          {/* Final Response */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Brain className="h-5 w-5 text-purple-400" />
                Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="whitespace-pre-wrap text-sm bg-background rounded-lg p-4 border border-border text-foreground leading-relaxed"
                style={{ 
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))'
                }}
              >
                {currentResponse.response}
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-foreground">Prompt Tokens</div>
                  <div className="text-blue-400 font-mono">{currentResponse.usage.promptTokens}</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Completion Tokens</div>
                  <div className="text-green-400 font-mono">{currentResponse.usage.completionTokens}</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Reasoning Tokens</div>
                  <div className="text-orange-400 font-mono">{currentResponse.usage.reasoningTokens}</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Processing Time</div>
                  <div className="text-purple-400 font-mono">{currentResponse.processingTime}ms</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-gray-400" />
              Conversation History ({conversation.length} messages)
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {conversation.map((message, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border border-border ${
                    message.role === 'user' 
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                      : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  }`}
                >
                  <div className="text-xs font-medium mb-1 text-muted-foreground uppercase">
                    {message.role}
                  </div>
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}