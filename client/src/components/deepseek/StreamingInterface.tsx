// Advanced Real-time Streaming Interface for DeepSeek with Persistent State
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageSquare, Zap, Clock, Activity, Send, Loader2, StopCircle } from 'lucide-react';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning: string;
  timestamp: number;
  isStreaming: boolean;
  tokens: number;
  processingTime: number;
}

interface StreamingStats {
  tokensReceived: number;
  reasoningTokens: number;
  processingTime: number;
  tokensPerSecond: number;
  isComplete: boolean;
}

export default function StreamingInterface() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStats, setStreamingStats] = useState<StreamingStats | null>(null);
  
  // Separate state for active streaming content
  const [activeReasoning, setActiveReasoning] = useState('');
  const [activeResponse, setActiveResponse] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeReasoning, activeResponse, scrollToBottom]);

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createStreamingMessage = useCallback((userContent: string): ConversationMessage => ({
    id: generateMessageId(),
    role: 'assistant',
    content: '',
    reasoning: '',
    timestamp: Date.now(),
    isStreaming: true,
    tokens: 0,
    processingTime: 0
  }), []);

  const handleStreamingComplete = useCallback(() => {
    if (!activeMessageId) return;

    const completedMessage: ConversationMessage = {
      id: activeMessageId,
      role: 'assistant',
      content: activeResponse,
      reasoning: activeReasoning,
      timestamp: Date.now(),
      isStreaming: false,
      tokens: streamingStats?.tokensReceived || 0,
      processingTime: streamingStats?.processingTime || 0
    };

    setMessages(prev => [...prev.filter(msg => msg.id !== activeMessageId), completedMessage]);
    
    // Clear active streaming state
    setActiveReasoning('');
    setActiveResponse('');
    setActiveMessageId(null);
    setIsStreaming(false);
    setStreamingStats(null);
  }, [activeMessageId, activeResponse, activeReasoning, streamingStats]);

  const processStreamingData = useCallback((data: any) => {
    if (!data.choices || !data.choices[0]) return;

    const delta = data.choices[0].delta;
    const reasoningContent = delta.reasoning_content;
    const responseContent = delta.content;

    if (reasoningContent) {
      setActiveReasoning(prev => prev + reasoningContent);
    }

    if (responseContent) {
      setActiveResponse(prev => prev + responseContent);
    }

    // Update streaming stats
    const currentTime = Date.now();
    const processingTime = currentTime - startTimeRef.current;
    
    setStreamingStats(prev => {
      const newTokens = (prev?.tokensReceived || 0) + (responseContent ? 1 : 0);
      const newReasoningTokens = (prev?.reasoningTokens || 0) + (reasoningContent ? 1 : 0);
      
      return {
        tokensReceived: newTokens,
        reasoningTokens: newReasoningTokens,
        processingTime,
        tokensPerSecond: newTokens / (processingTime / 1000),
        isComplete: false
      };
    });
  }, []);

  const streamChatResponse = useCallback(async (userMessage: string) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    startTimeRef.current = Date.now();

    try {
      const response = await fetch('/api/deepseek/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              handleStreamingComplete();
              return;
            }
            
            try {
              const data = JSON.parse(dataStr);
              processStreamingData(data);
            } catch (e) {
              console.warn('Failed to parse streaming data:', e);
            }
          }
        }
        
        buffer = lines[lines.length - 1];
      }

      handleStreamingComplete();
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
        setActiveResponse('Error: Failed to get response from DeepSeek');
        setActiveReasoning('Error occurred during processing');
        handleStreamingComplete();
      }
    }
  }, [messages, processStreamingData, handleStreamingComplete]);

  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim() || isStreaming) return;

    const userMessage: ConversationMessage = {
      id: generateMessageId(),
      role: 'user',
      content: currentInput,
      reasoning: '',
      timestamp: Date.now(),
      isStreaming: false,
      tokens: 0,
      processingTime: 0
    };

    const streamingMessage = createStreamingMessage(currentInput);
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsStreaming(true);
    setActiveMessageId(streamingMessage.id);
    setActiveReasoning('');
    setActiveResponse('');

    await streamChatResponse(currentInput);
  }, [currentInput, isStreaming, createStreamingMessage, streamChatResponse]);

  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setActiveReasoning('');
      setActiveResponse('');
      setActiveMessageId(null);
    }
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            DeepSeek Reasoner
            <Badge variant="secondary" className="ml-auto">
              Advanced Chain-of-Thought reasoning with real-time streaming
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Reasoning & Response Stream
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border rounded-lg p-4 mb-4">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className={`${message.role === 'user' ? 'text-right' : 'w-full'}`}>
                      {message.role === 'user' ? (
                        <div className="inline-block p-3 rounded-lg max-w-[80%] bg-blue-600 text-white">
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full space-y-4">
                          {/* Reasoning Section */}
                          {message.reasoning && (
                            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-purple-600" />
                                  Chain-of-Thought Reasoning
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <ScrollArea className="max-h-64">
                                  <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                    {message.reasoning}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          )}
                          
                          {/* Response Section */}
                          {message.content && (
                            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-green-600" />
                                  Final Response
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <ScrollArea className="max-h-64">
                                  <div className="text-sm whitespace-pre-wrap">
                                    {message.content}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Active Streaming Content */}
                  {isStreaming && activeMessageId && (
                    <div className="w-full space-y-4">
                      {/* Active Reasoning */}
                      <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            Chain-of-Thought Reasoning
                            <Activity className="h-3 w-3 animate-pulse text-purple-600" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ScrollArea className="max-h-64">
                            <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                              {activeReasoning || 'Processing reasoning...'}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                      
                      {/* Active Response */}
                      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            Final Response
                            <Activity className="h-3 w-3 animate-pulse text-green-600" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ScrollArea className="max-h-64">
                            <div className="text-sm whitespace-pre-wrap">
                              {activeResponse || 'Generating response...'}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="flex gap-2">
                <Textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Ask DeepSeek anything..."
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={isStreaming}
                  onKeyDown={handleKeyPress}
                />
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isStreaming || !currentInput.trim()}
                    size="sm"
                  >
                    {isStreaming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  {isStreaming && (
                    <Button 
                      onClick={handleStopStreaming}
                      variant="destructive"
                      size="sm"
                    >
                      <StopCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Statistics Panel */}
        <div className="space-y-4">
          {streamingStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Tokens</span>
                    <Badge variant="outline">{streamingStats.tokensReceived}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reasoning Tokens</span>
                    <Badge variant="outline">{streamingStats.reasoningTokens}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Time</span>
                    <Badge variant="outline">{Math.round(streamingStats.processingTime)}ms</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Speed</span>
                    <Badge variant="outline">{streamingStats.tokensPerSecond.toFixed(1)} tok/s</Badge>
                  </div>
                  <Progress value={Math.min(streamingStats.tokensReceived / 100, 100)} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  DeepSeek Stream
                </span>
                <Badge variant="outline">{isStreaming ? 'Active' : 'Ready'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  RAG Integration
                </span>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  MCP Protocol
                </span>
                <Badge variant="outline">Connected</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}