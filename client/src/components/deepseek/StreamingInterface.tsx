// Streaming Interface for DeepSeek with Real-time Token Updates
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, MessageSquare, Zap, Clock, Activity, Send, Loader2 } from 'lucide-react';

interface StreamingMessage {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  timestamp: number;
  streaming?: boolean;
}

interface StreamingStats {
  tokensReceived: number;
  processingTime: number;
  tokensPerSecond: number;
  reasoning: string;
}

export default function StreamingInterface() {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStats, setStreamingStats] = useState<StreamingStats | null>(null);
  const [currentStreamingContent, setCurrentStreamingContent] = useState('');
  const [currentReasoning, setCurrentReasoning] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingContent]);

  const streamChatResponse = useCallback(async (messages: any[], onToken: (token: string) => void, onReasoning: (reasoning: string) => void) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/deepseek/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim();
          if (part.startsWith('data:')) {
            const jsonStr = part.slice(5).trim();
            if (jsonStr === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const token = parsed.choices?.[0]?.delta?.content;
              const reasoning = parsed.choices?.[0]?.delta?.reasoning_content;
              
              if (token) onToken(token);
              if (reasoning) onReasoning(reasoning);
            } catch (e) {
              console.warn('JSON parse error', e);
            }
          }
        }
        buffer = parts[parts.length - 1];
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
        throw error;
      }
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim() || isStreaming) return;

    const userMessage: StreamingMessage = {
      role: 'user',
      content: currentInput,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsStreaming(true);
    setCurrentStreamingContent('');
    setCurrentReasoning('');

    const startTime = Date.now();
    let tokenCount = 0;

    const assistantMessage: StreamingMessage = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      await streamChatResponse(
        [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content })),
        (token: string) => {
          tokenCount++;
          setCurrentStreamingContent(prev => prev + token);
          setStreamingStats({
            tokensReceived: tokenCount,
            processingTime: Date.now() - startTime,
            tokensPerSecond: tokenCount / ((Date.now() - startTime) / 1000),
            reasoning: currentReasoning,
          });
        },
        (reasoning: string) => {
          setCurrentReasoning(prev => prev + reasoning);
        }
      );

      // Update final message
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 
            ? { ...msg, content: currentStreamingContent, reasoning: currentReasoning, streaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Failed to stream response:', error);
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 
            ? { ...msg, content: 'Error: Failed to get response', reasoning: 'Error occurred during processing', streaming: false }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      setCurrentStreamingContent('');
      setCurrentReasoning('');
    }
  }, [currentInput, isStreaming, messages, streamChatResponse, currentStreamingContent, currentReasoning]);

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            DeepSeek Reasoner
            <Badge variant="secondary" className="ml-auto">
              Advanced Chain-of-Thought reasoning with integrated RAG 2.0, A2A protocol, and MCP tools
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                DeepSeek Reasoning & Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border rounded-lg p-4 mb-4">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.role === 'user' ? (
                      <div className="inline-block p-3 rounded-lg max-w-[80%] bg-blue-600 text-white">
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full space-y-4">
                        {/* Reasoning Section - Shows First */}
                        {(currentReasoning || (message.streaming && index === messages.length - 1)) && (
                          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-600" />
                                Chain-of-Thought Reasoning
                                {message.streaming && index === messages.length - 1 && (
                                  <Activity className="h-3 w-3 animate-pulse text-purple-600" />
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 max-h-64 overflow-y-auto">
                                {message.streaming && index === messages.length - 1 
                                  ? currentReasoning 
                                  : message.reasoning || 'Processing reasoning...'}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Response Section - Shows Below Reasoning */}
                        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-green-600" />
                              Final Response
                              {message.streaming && index === messages.length - 1 && (
                                <Activity className="h-3 w-3 animate-pulse text-green-600" />
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {message.streaming && index === messages.length - 1 
                                ? currentStreamingContent || 'Generating response...'
                                : message.content}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Ask DeepSeek anything..."
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={isStreaming}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
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
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Analytics */}
        <div className="space-y-4">
          {streamingStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Live Streaming Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tokens Received</span>
                    <Badge>{streamingStats.tokensReceived}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Time</span>
                    <Badge>{Math.round(streamingStats.processingTime)}ms</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tokens/Second</span>
                    <Badge>{streamingStats.tokensPerSecond.toFixed(1)}</Badge>
                  </div>
                  <Progress value={Math.min(streamingStats.tokensReceived / 50, 100)} />
                </div>
              </CardContent>
            </Card>
          )}

          {currentReasoning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Chain-of-Thought
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                    {currentReasoning}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Integration Systems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  RAG Integration
                </span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  A2A Protocol
                </span>
                <Badge variant="outline">Coordinating</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  MCP Tools
                </span>
                <Badge variant="outline">Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}