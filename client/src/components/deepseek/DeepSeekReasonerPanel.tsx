// DeepSeek Reasoner Panel - Main Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Brain, Zap, Database } from 'lucide-react';
import { DeepSeekService, useDeepSeekStore } from '@/services/deepseek';

export function DeepSeekReasonerPanel() {
  const [query, setQuery] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  
  const { 
    isLoading, 
    currentResponse, 
    error, 
    conversation 
  } = useDeepSeekStore();

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    await DeepSeekService.processQuery(query, { ragEnabled });
    setQuery('');
  };

  const handleClear = () => {
    DeepSeekService.clearConversation();
    setQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">DeepSeek Reasoner</h2>
          <Badge variant="secondary">v2.0</Badge>
        </div>
        <Button 
          variant="outline" 
          onClick={handleClear}
          disabled={isLoading}
        >
          Clear Conversation
        </Button>
      </div>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Query Input</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask DeepSeek anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
            disabled={isLoading}
          />
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="rag-enabled"
                checked={ragEnabled}
                onCheckedChange={setRagEnabled}
                disabled={isLoading}
              />
              <Label htmlFor="rag-enabled" className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>RAG Enhanced</span>
              </Label>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !query.trim()}
              className="ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Submit Query'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600 font-medium">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {currentResponse && (
        <div className="space-y-4">
          {/* Reasoning Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reasoning Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {currentResponse.reasoning}
              </div>
            </CardContent>
          </Card>

          {/* Response Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm">
                {currentResponse.response}
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Prompt Tokens</div>
                  <div className="text-gray-600">{currentResponse.usage.promptTokens}</div>
                </div>
                <div>
                  <div className="font-medium">Completion Tokens</div>
                  <div className="text-gray-600">{currentResponse.usage.completionTokens}</div>
                </div>
                <div>
                  <div className="font-medium">Reasoning Tokens</div>
                  <div className="text-gray-600">{currentResponse.usage.reasoningTokens}</div>
                </div>
                <div>
                  <div className="font-medium">Processing Time</div>
                  <div className="text-gray-600">{currentResponse.processingTime}ms</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}