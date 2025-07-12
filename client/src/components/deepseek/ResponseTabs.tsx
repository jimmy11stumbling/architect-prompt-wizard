// Response Tabs Component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageSquare, BarChart3, Clock, Zap, Database } from 'lucide-react';

interface ResponseTabsProps {
  response: {
    reasoning: string;
    response: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      reasoningTokens: number;
      totalTokens: number;
    };
    processingTime: number;
    conversationId: string;
  };
}

export default function ResponseTabs({ response }: ResponseTabsProps) {
  const reasoningProgress = (response.usage.reasoningTokens / 32000) * 100;
  const responseProgress = (response.usage.completionTokens / 15000) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          DeepSeek Response Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reasoning" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reasoning" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Reasoning Process
            </TabsTrigger>
            <TabsTrigger value="response" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Final Response
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reasoning" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Chain of Thought Process</span>
              </div>
              <Badge variant="secondary">
                {response.usage.reasoningTokens} reasoning tokens
              </Badge>
            </div>
            <Progress value={reasoningProgress} className="w-full" />
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {response.reasoning}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Final Response</span>
              </div>
              <Badge variant="secondary">
                {response.usage.completionTokens} completion tokens
              </Badge>
            </div>
            <Progress value={responseProgress} className="w-full" />
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {response.response}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Token Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Prompt Tokens</span>
                    <Badge variant="outline">{response.usage.promptTokens}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Reasoning Tokens</span>
                    <Badge variant="outline">{response.usage.reasoningTokens}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Tokens</span>
                    <Badge variant="outline">{response.usage.completionTokens}</Badge>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm font-semibold">Total Tokens</span>
                    <Badge>{response.usage.totalTokens}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Processing Time</span>
                    <Badge variant="outline">{response.processingTime}ms</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Reasoning Efficiency</span>
                    <Badge variant="outline">
                      {Math.round((response.usage.reasoningTokens / response.processingTime) * 1000)} tokens/s
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Quality</span>
                    <Badge variant="outline">High</Badge>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm font-semibold">Conversation ID</span>
                    <Badge className="text-xs">{response.conversationId.slice(-8)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Token Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Reasoning Tokens</span>
                    <span>{response.usage.reasoningTokens}/{32000}</span>
                  </div>
                  <Progress value={reasoningProgress} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Tokens</span>
                    <span>{response.usage.completionTokens}/{15000}</span>
                  </div>
                  <Progress value={responseProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}