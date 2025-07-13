import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Save, Database, Network, Zap, Clock, Activity, MessageSquare, Bot, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DeepSeekService, useDeepSeekStore } from '@/services/deepseek';
import { ragService } from '@/services/rag/ragService';
import { mcpHubService } from '@/services/mcp/mcpHubService';
import StreamingFeedback from './StreamingFeedback';
import TypewriterEffect from './TypewriterEffect';

interface SavedConversation {
  id: number;
  title: string;
  description: string;
  reasoning: string;
  response: string;
  timestamp: number;
  ragEnabled: boolean;
  mcpEnabled: boolean;
  tokensUsed: number;
}

export default function EnhancedDeepSeekReasoner() {
  const [query, setQuery] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  const [mcpEnabled, setMcpEnabled] = useState(true);
  const [a2aEnabled, setA2aEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [conversationTitle, setConversationTitle] = useState('');
  const [ragStats, setRagStats] = useState(null);
  const [mcpStats, setMcpStats] = useState(null);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const { toast } = useToast();

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
  const conversationRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when streaming content updates
  useEffect(() => {
    if (reasoningRef.current && storeIsStreaming && streamingReasoning) {
      const element = reasoningRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [streamingReasoning, storeIsStreaming]);

  useEffect(() => {
    if (responseContentRef.current && storeIsStreaming && streamingResponse) {
      const element = responseContentRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [streamingResponse, storeIsStreaming]);

  // Auto-scroll to response when streaming starts
  useEffect(() => {
    if (storeIsStreaming && (streamingReasoning || streamingResponse)) {
      const responseElement = document.getElementById('enhanced-streaming-response-section');
      if (responseElement) {
        responseElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [storeIsStreaming, streamingReasoning, streamingResponse]);

  const loadSavedSessions = async () => {
    try {
      // Try to load from database first
      const response = await fetch('/api/deepseek/sessions?userId=1');
      if (response.ok) {
        const dbSessions = await response.json();
        const conversations: SavedConversation[] = dbSessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          description: session.description,
          reasoning: session.reasoning,
          response: session.response,
          timestamp: new Date(session.createdAt).getTime(),
          ragEnabled: session.ragEnabled,
          mcpEnabled: session.mcpEnabled,
          tokensUsed: session.tokensUsed
        }));
        setSavedConversations(conversations);

        // Also update localStorage as backup
        localStorage.setItem('deepseek-conversations', JSON.stringify(conversations));
      } else {
        throw new Error('Database load failed');
      }
    } catch (error) {
      console.warn('Failed to load from database, using localStorage:', error);

      // Fallback to localStorage
      const saved = localStorage.getItem('deepseek-conversations');
      if (saved) {
        setSavedConversations(JSON.parse(saved));
      }
    }
  };

  // Load system stats and saved conversations on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ragData, mcpData] = await Promise.all([
          ragService.getRAGStats(),
          mcpHubService.getAssetStatistics()
        ]);
        setRagStats(ragData);
        setMcpStats(mcpData);

        // Load saved conversations from database and localStorage
        await loadSavedSessions();
      } catch (error) {
        console.warn('Failed to load system stats:', error);
      }
    };
    loadData();
  }, []);

  // Auto-save conversation when streaming completes
  useEffect(() => {
    if (autoSave && !storeIsStreaming && currentResponse && streamingReasoning && streamingResponse) {
      handleAutoSave();
    }
  }, [autoSave, storeIsStreaming, currentResponse, streamingReasoning, streamingResponse]);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading || storeIsStreaming) return;

    try {
      // Generate auto title if not provided
      if (!conversationTitle.trim()) {
        const autoTitle = query.length > 50 ? query.substring(0, 50) + '...' : query;
        setConversationTitle(autoTitle);
      }

      await DeepSeekService.processQueryStreaming(query, { 
        ragEnabled,
        mcpEnabled,
        a2aEnabled,
        temperature: 0.1 
      });
      setQuery('');
    } catch (error) {
      console.error('Query failed:', error);
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Failed to process query",
        variant: "destructive"
      });
    }
  };

  const handleAutoSave = async () => {
    if (!currentResponse || !streamingReasoning || !streamingResponse) return;

    const sessionData = {
      userId: 1, // Default user ID
      title: conversationTitle || `Reasoning Session ${new Date().toLocaleString()}`,
      description: query.length > 100 ? query.substring(0, 100) + '...' : query,
      query,
      reasoning: streamingReasoning,
      response: streamingResponse,
      ragEnabled,
      mcpEnabled,
      tokensUsed: currentResponse.usage.totalTokens,
      reasoningTokens: currentResponse.usage.reasoningTokens || 0,
      responseTokens: currentResponse.usage.completionTokens || 0,
      processingTime: currentResponse.processingTime || 0,
      temperature: "0.1",
      tags: ['deepseek', 'reasoning', ragEnabled ? 'rag' : '', mcpEnabled ? 'mcp' : ''].filter(Boolean),
      metadata: {
        ragStats: ragStats,
        mcpStats: mcpStats,
        timestamp: Date.now()
      },
      isPublic: false
    };

    // Save to database via API
    try {
      const response = await fetch('/api/deepseek/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const savedSession = await response.json();

        // Create local conversation object for UI
        const conversation: SavedConversation = {
          id: savedSession.id,
          title: savedSession.title,
          description: savedSession.description,
          reasoning: savedSession.reasoning,
          response: savedSession.response,
          timestamp: new Date(savedSession.createdAt).getTime(),
          ragEnabled: savedSession.ragEnabled,
          mcpEnabled: savedSession.mcpEnabled,
          tokensUsed: savedSession.tokensUsed
        };

        // Update local state
        const updated = [conversation, ...savedConversations];
        setSavedConversations(updated);
        localStorage.setItem('deepseek-conversations', JSON.stringify(updated));

        toast({
          title: "Session Saved Successfully",
          description: "Reasoning session saved to database with full metadata",
        });
      } else {
        throw new Error('Database save failed');
      }
    } catch (error) {
      console.warn('Failed to save to database:', error);

      // Fallback to localStorage only
      const conversation: SavedConversation = {
        id: Date.now(),
        title: sessionData.title,
        description: sessionData.description,
        reasoning: streamingReasoning,
        response: streamingResponse,
        timestamp: Date.now(),
        ragEnabled,
        mcpEnabled,
        tokensUsed: currentResponse.usage.totalTokens
      };

      const updated = [conversation, ...savedConversations];
      setSavedConversations(updated);
      localStorage.setItem('deepseek-conversations', JSON.stringify(updated));

      toast({
        title: "Session Saved Locally",
        description: "Saved to local storage (database save failed)",
        variant: "destructive"
      });
    }
  };

  const handleManualSave = () => {
    handleAutoSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const loadConversation = (conversation: SavedConversation) => {
    // Load a saved conversation
    setConversationTitle(conversation.title);
    setRagEnabled(conversation.ragEnabled);
    setMcpEnabled(conversation.mcpEnabled);
    // Note: We could restore the full conversation state here if needed
  };

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header with Statistics */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Brain className="h-8 w-8 text-blue-400" />
            Enhanced DeepSeek Reasoner
            <Badge variant="outline" className="ml-auto">
              Token-by-Token Streaming
            </Badge>
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-400" />
              <span className="text-sm">RAG: {ragStats?.documentsIndexed || 0} docs</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-purple-400" />
              <span className="text-sm">MCP: {mcpStats?.totalAssets || 0} assets</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              <span className="text-sm">Saved: {savedConversations.length}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="conversation-title">Conversation Title</Label>
              <Input
                id="conversation-title"
                value={conversationTitle}
                onChange={(e) => setConversationTitle(e.target.value)}
                placeholder="Optional: Name this reasoning session"
                className="mt-1"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-400" />
                  <Label htmlFor="rag-toggle">RAG 2.0 Integration</Label>
                </div>
                <Switch
                  id="rag-toggle"
                  checked={ragEnabled}
                  onCheckedChange={setRagEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-purple-400" />
                  <Label htmlFor="mcp-toggle">MCP Protocol</Label>
                </div>
                <Switch
                  id="mcp-toggle"
                  checked={mcpEnabled}
                  onCheckedChange={setMcpEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mcp-enabled"
                    checked={mcpEnabled}
                    onCheckedChange={setMcpEnabled}
                  />
                  <Label htmlFor="mcp-enabled">MCP Integration</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="a2a-enabled"
                    checked={a2aEnabled}
                    onCheckedChange={setA2aEnabled}
                  />
                  <Label htmlFor="a2a-enabled">A2A Protocol</Label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4 text-blue-400" />
                  <Label htmlFor="auto-save-toggle">Auto-save Sessions</Label>
                </div>
                <Switch
                  id="auto-save-toggle"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Your Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your query for deep reasoning analysis... (Ctrl+Enter to submit)"
            className="min-h-[120px] resize-none"
            disabled={isLoading || storeIsStreaming}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
              <span>to submit</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleManualSave}
                variant="outline"
                size="sm"
                disabled={!currentResponse || storeIsStreaming}
              >
                <Save className="h-4 w-4 mr-1" />
                Save Session
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!query.trim() || isLoading || storeIsStreaming}
                className="min-w-[120px]"
              >
                {storeIsStreaming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reasoning...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Start Reasoning
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Working Status - Show when streaming starts */}
      {storeIsStreaming && (
        <Card className="border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-yellow-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-400">DeepSeek AI is Working Hard</div>
                <div className="text-sm text-gray-300">
                  {!streamingReasoning && !streamingResponse ? 'Connecting to AI...' :
                   streamingReasoning && !streamingResponse ? '🤖 Deep reasoning in progress...' :
                   streamingResponse ? '📝 Generating final response...' : 'Processing...'}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {(currentResponse || storeIsStreaming) && (
        <div id="enhanced-streaming-response-section" className="space-y-4">
          {/* Enhanced Streaming Status with Token Counters */}
          {storeIsStreaming && (
            <StreamingFeedback 
              active={storeIsStreaming}
              stage={
                streamingReasoning && !streamingResponse ? 'reasoning' :
                streamingResponse ? 'responding' : 'connecting'
              }
              reasoningTokens={streamingReasoning?.length || 0}
              responseTokens={streamingResponse?.length || 0}
            />
          )}

          {/* Chain-of-Thought Reasoning - Always visible during streaming */}
          {(storeIsStreaming || streamingReasoning || currentResponse?.reasoning) && (
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Chain-of-Thought Reasoning
                  {(storeIsStreaming || streamingReasoning) && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Activity className="h-4 w-4 text-blue-400 animate-pulse" />
                      <Badge variant="outline" className="text-xs">
                        {streamingReasoning.length} tokens
                      </Badge>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={reasoningRef}
                  className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 max-h-96 overflow-y-auto min-h-[200px]"
                >
                  {storeIsStreaming && !streamingReasoning ? (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                      <div className="flex flex-col items-center">
                        <Brain className="h-8 w-8 animate-pulse mb-2" />
                        <span className="italic">🧠 Deep reasoning in progress...</span>
                        <div className="flex gap-1 mt-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {streamingReasoning || currentResponse?.reasoning || 'Waiting for reasoning content...'}
                      {storeIsStreaming && streamingReasoning && (
                        <span className="animate-pulse">▌</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Response - Always visible during streaming */}
          <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                Final Response
                {(storeIsStreaming || streamingResponse) && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Activity className="h-4 w-4 text-purple-400 animate-pulse" />
                    <Badge variant="outline" className="text-xs">
                      {streamingResponse.length} tokens
                    </Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={responseContentRef}
                className="prose prose-slate dark:prose-invert max-w-none max-h-96 overflow-y-auto min-h-[150px]"
              >
                {storeIsStreaming && !streamingResponse ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <Clock className="h-8 w-8 animate-spin mb-2" />
                    <span className="italic">
                      {streamingReasoning ? '🧠 Reasoning complete, generating response...' : '⏳ Waiting for reasoning to complete...''}
                    </span>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {streamingResponse || currentResponse?.response || 'Waiting for response...'}
                    {storeIsStreaming && streamingResponse && (
                      <span className="animate-pulse">▌</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          {currentResponse && !storeIsStreaming && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{currentResponse.usage.reasoningTokens}</div>
                    <div className="text-xs text-muted-foreground">Reasoning Tokens</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">{currentResponse.usage.completionTokens}</div>
                    <div className="text-xs text-muted-foreground">Response Tokens</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">{currentResponse.usage.totalTokens}</div>
                    <div className="text-xs text-muted-foreground">Total Tokens</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">{currentResponse.processingTime}ms</div>
                    <div className="text-xs text-muted-foreground">Processing Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-500 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Conversations */}
      {savedConversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Recent Reasoning Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedConversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                  onClick={() => loadConversation(conv)}
                >
                  <div>
                    <div className="font-medium text-sm">{conv.title}</div>
                    <div className="text-xs text-muted-foreground">{conv.description}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(conv.timestamp).toLocaleDateString()}
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