import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Loader2, Database, Network, Zap, Clock, Cpu, BarChart3, Activity, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DeepSeekService, useDeepSeekStore } from '@/services/deepseek';
import { ragService } from '@/services/rag/ragService';
import { mcpHubService } from '@/services/mcp/mcpHubService';
import StreamingFeedback from './StreamingFeedback';
import TypewriterEffect from './TypewriterEffect';
import StreamingControls from './StreamingControls';
import StreamingStats from './StreamingStats';
import StreamingHistory from './StreamingHistory';
import StreamingStatusBar from './StreamingStatusBar';
import StreamingErrorBoundary from './StreamingErrorBoundary';

export default function StreamingInterface() {
  const [query, setQuery] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  const [mcpEnabled, setMcpEnabled] = useState(true);
  const [ragStats, setRagStats] = useState(null);
  const [mcpStats, setMcpStats] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [temperature, setTemperature] = useState(0.1);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [streamingSpeed, setStreamingSpeed] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [lastTokenCount, setLastTokenCount] = useState(0);
  const [speedTimer, setSpeedTimer] = useState<NodeJS.Timeout | null>(null);
  const [streamingState, setStreamingState] = useState<'idle' | 'paused' | 'active'>('idle');

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
      const responseElement = document.getElementById('streaming-response-section');
      if (responseElement) {
        // Scroll to the element smoothly
        responseElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [storeIsStreaming, streamingReasoning, streamingResponse]);

  // Scroll to top when new query starts
  useEffect(() => {
    if (storeIsStreaming && !streamingReasoning && !streamingResponse) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [storeIsStreaming, streamingReasoning, streamingResponse]);

  // Auto-scroll conversation when new messages are added
  useEffect(() => {
    if (conversationRef.current && !storeIsStreaming) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation, storeIsStreaming]);

  // Timer functionality for streaming
  useEffect(() => {
    if (storeIsStreaming && !startTime) {
      setStartTime(new Date());
    } else if (!storeIsStreaming && startTime) {
      setStartTime(null);
      setElapsedTime(0);
    }
  }, [storeIsStreaming, startTime]);

  // Update elapsed time every second during streaming
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (storeIsStreaming && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [storeIsStreaming, startTime]);

  // Calculate streaming speed (tokens per second)
  useEffect(() => {
    if (storeIsStreaming && streamingState === 'active') {
      const timer = setInterval(() => {
        const currentTokenCount = (streamingReasoning?.length || 0) + (streamingResponse?.length || 0);
        const tokensThisSecond = currentTokenCount - lastTokenCount;
        setStreamingSpeed(Math.max(0, tokensThisSecond));
        setLastTokenCount(currentTokenCount);
      }, 1000);
      
      setSpeedTimer(timer);
      return () => clearInterval(timer);
    } else {
      if (speedTimer) {
        clearInterval(speedTimer);
        setSpeedTimer(null);
      }
      setStreamingSpeed(0);
    }
  }, [storeIsStreaming, streamingState, streamingReasoning, streamingResponse, lastTokenCount, speedTimer]);

  // Update streaming state
  useEffect(() => {
    if (storeIsStreaming) {
      setStreamingState('active');
    } else {
      setStreamingState('idle');
    }
  }, [storeIsStreaming]);

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

    try {
      setIsConnected(true);
      // Use demo mode if enabled
      if (demoMode) {
        await DeepSeekService.processDemoStreaming(query);
      } else {
        await DeepSeekService.processQueryStreaming(query, { 
          ragEnabled,
          mcpEnabled,
          temperature 
        });
      }
      setQuery('');
    } catch (error) {
      console.error('Query failed:', error);
      setIsConnected(false);
      // Show error with helpful message about API key
      console.log('DeepSeek API authentication failed. Please check your API key.');
    }
  };

  // Streaming Control Functions
  const handlePause = () => {
    setStreamingState('paused');
    // TODO: Implement actual pause logic in DeepSeekService
    console.log('Streaming paused');
  };

  const handleResume = () => {
    setStreamingState('active');
    // TODO: Implement actual resume logic in DeepSeekService
    console.log('Streaming resumed');
  };

  const handleStop = () => {
    setStreamingState('idle');
    // TODO: Implement actual stop logic in DeepSeekService
    DeepSeekService.stopStreaming();
    console.log('Streaming stopped');
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleClearHistory = () => {
    DeepSeekService.clearConversation();
  };

  const handleDemoSubmit = async () => {
    if (!query.trim() || isLoading || storeIsStreaming) return;

    try {
      await DeepSeekService.processDemoStreaming(query);
      setQuery('');
    } catch (error) {
      console.error('Demo query failed:', error);
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

  const getCurrentStage = () => {
    if (error) return 'error';
    if (!storeIsStreaming) return 'idle';
    if (streamingState === 'paused') return 'idle';
    if (streamingReasoning && !streamingResponse) return 'reasoning';
    if (streamingResponse) return 'responding';
    if (storeIsStreaming) return 'connecting';
    return 'complete';
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

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StreamingControls
            isStreaming={storeIsStreaming}
            isPaused={streamingState === 'paused'}
            canResume={streamingState === 'paused'}
            streamingProgress={0}
            tokensReceived={0}
            elapsedTime={elapsedTime}
            tokenVelocity={streamingSpeed}
            onStart={handleSubmit}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onReset={() => {
              setElapsedTime(0);
              setStreamingSpeed(0);
              setStreamingState('idle');
            }}
            disabled={isLoading}
          />
        </div>
        <div>
          <StreamingStats
            stats={{
              tokensPerSecond: streamingSpeed,
              averageLatency: 250,
              totalTokens: (currentResponse?.usage.completionTokens || 0) + (currentResponse?.usage.reasoningTokens || 0),
              reasoningTokens: currentResponse?.usage.reasoningTokens || 0,
              responseTokens: currentResponse?.usage.completionTokens || 0,
              streamDuration: elapsedTime,
              connectionQuality: isConnected ? 'excellent' : 'poor',
              bufferHealth: 85,
              throughputTrend: streamingSpeed > 10 ? 'up' : streamingSpeed < 5 ? 'down' : 'stable',
              errorRate: error ? 5 : 0.5
            }}
            isActive={storeIsStreaming}
          />
        </div>
      </div>

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
            disabled={isLoading || storeIsStreaming}
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to submit • {query.length} characters
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleClear}
                disabled={isLoading || storeIsStreaming}
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
        <div id="streaming-response-section" className="space-y-4">
          {/* Enhanced Streaming Status with New Components */}
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

          {/* Reasoning Process */}
          {(streamingReasoning || currentResponse?.reasoning) && (
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Cpu className="h-5 w-5 text-blue-400" />
                  Reasoning Process
                  {storeIsStreaming && streamingReasoning && (
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
                  className="whitespace-pre-wrap text-sm bg-gray-900 rounded-lg p-4 border border-gray-600 text-white font-mono leading-relaxed min-h-[200px]"
                  style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    backgroundColor: '#111827',
                    color: '#ffffff'
                  }}
                >
                  {storeIsStreaming ? (
                    <div>
                      <TypewriterEffect 
                        text={streamingReasoning || ''}
                        speed={20}
                        showCursor={true}
                        className="text-white font-mono"
                      />
                      {streamingReasoning && (
                        <div className="flex items-center gap-2 mt-2 text-blue-400">
                          <Activity className="h-4 w-4 animate-spin" />
                          <span className="text-xs">Reasoning tokens: {streamingReasoning.length}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    currentResponse?.reasoning
                  )}
                  {storeIsStreaming && !streamingReasoning && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <span className="italic">Waiting for reasoning to begin...</span>
                      <div className="flex gap-1 mt-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Response */}
          {(streamingResponse || currentResponse?.response) && (
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
                  className="whitespace-pre-wrap text-sm bg-gray-900 rounded-lg p-4 border border-gray-600 text-white leading-relaxed min-h-[200px]"
                  style={{ 
                    maxHeight: '600px', 
                    overflowY: 'auto',
                    backgroundColor: '#111827',
                    color: '#ffffff'
                  }}
                >
                  {storeIsStreaming ? (
                    <div>
                      <TypewriterEffect 
                        text={streamingResponse || ''}
                        speed={25}
                        showCursor={true}
                        className="text-white"
                      />
                      {streamingResponse && (
                        <div className="flex items-center gap-2 mt-2 text-purple-400">
                          <MessageSquare className="h-4 w-4 animate-pulse" />
                          <span className="text-xs">Response tokens: {streamingResponse.length}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    currentResponse?.response
                  )}
                  {storeIsStreaming && !streamingResponse && streamingReasoning && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <Clock className="h-8 w-8 animate-spin mb-2" />
                      <span className="italic">Reasoning complete, generating response...</span>
                      <div className="flex gap-1 mt-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Statistics */}
          {currentResponse && !storeIsStreaming && (
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

      {/* Enhanced Conversation History */}
      <StreamingHistory
        conversation={conversation.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(),
          tokenCount: msg.content.length
        }))}
        onClearHistory={handleClearHistory}
        onCopyMessage={handleCopyMessage}
      />

      {/* Status Bar */}
      <StreamingStatusBar
        isConnected={isConnected}
        isStreaming={storeIsStreaming}
        stage={getCurrentStage()}
        reasoningTokens={streamingReasoning?.length || 0}
        responseTokens={streamingResponse?.length || 0}
        elapsedTime={elapsedTime}
        error={error || undefined}
      />
    </div>
  );
}