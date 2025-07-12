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
    isStreaming: storeIsStreaming,
    currentResponse,
    streamingReasoning,
    streamingResponse,
    error, 
    conversation 
  } = useDeepSeekStore();

  // Auto-scroll refs
  const reasoningRef = useRef<HTMLDivElement>(null);
  const responseContentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when streaming content updates
  useEffect(() => {
    if (reasoningRef.current && storeIsStreaming && streamingReasoning) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [streamingReasoning, storeIsStreaming]);

  useEffect(() => {
    if (responseContentRef.current && storeIsStreaming && streamingResponse) {
      responseContentRef.current.scrollTop = responseContentRef.current.scrollHeight;
    }
  }, [streamingResponse, storeIsStreaming]);

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
    if (!query.trim() || isLoading || storeIsStreaming) return;

    setIsStreaming(true);

    try {
      await DeepSeekService.processQueryStreaming(query, { 
        ragEnabled,
        mcpEnabled,
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
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4 space-y-4 min-h-screen bg-gray-900 text-white">
      {/* Header with System Status */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-6 w-6 text-purple-400" />
            DeepSeek Reasoner
            <Badge variant="secondary" className="ml-auto bg-purple-600 text-white">
              Advanced Chain-of-Thought reasoning with real-time streaming
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Live Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Database className="h-4 w-4 text-blue-400" />
              RAG 2.0 Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-white">
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

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Network className="h-4 w-4 text-purple-400" />
              MCP Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-white">
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

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <BarChart3 className="h-4 w-4 text-yellow-400" />
              Processing Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-white">
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
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
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
            className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
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
                disabled={isLoading || storeIsStreaming || !query.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {(isLoading || storeIsStreaming) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {storeIsStreaming ? 'Streaming...' : 'Processing...'}
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
        <Card className="border-red-500 bg-red-900/50">
          <CardContent className="pt-6">
            <div className="text-red-400 font-medium">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {(currentResponse || storeIsStreaming) && (
        <div className="space-y-4">
          {/* Streaming Status */}
          {storeIsStreaming && (
            <Card className="border-blue-500 bg-blue-900/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">
                    Streaming DeepSeek Response...
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {streamingReasoning.length + streamingResponse.length} tokens
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reasoning Process */}
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Cpu className="h-5 w-5 text-blue-400" />
                Reasoning Process
                {storeIsStreaming && (
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={reasoningRef}
                className="whitespace-pre-wrap text-sm bg-gray-900 rounded-lg p-4 border border-gray-600 text-white font-mono leading-relaxed"
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  backgroundColor: '#111827',
                  color: '#ffffff'
                }}
              >
                {storeIsStreaming ? streamingReasoning : currentResponse?.reasoning}
                {storeIsStreaming && streamingReasoning && (
                  <span className="animate-pulse text-blue-400">|</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Final Response */}
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-purple-400" />
                Response
                {storeIsStreaming && streamingResponse && (
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={responseContentRef}
                className="whitespace-pre-wrap text-sm bg-gray-900 rounded-lg p-4 border border-gray-600 text-white leading-relaxed"
                style={{ 
                  backgroundColor: '#111827',
                  color: '#ffffff'
                }}
              >
                {storeIsStreaming ? streamingResponse : currentResponse?.response}
                {storeIsStreaming && streamingResponse && (
                  <span className="animate-pulse text-purple-400">|</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          {currentResponse && (
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-sm text-white">Usage Statistics</CardTitle>
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
          )}
        </div>
      )}

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-gray-400" />
              Conversation History ({conversation.length} messages)
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {conversation.map((message, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    message.role === 'user' 
                      ? 'bg-blue-950/20 border-blue-800 text-foreground' 
                      : 'bg-green-950/20 border-green-800 text-foreground'
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