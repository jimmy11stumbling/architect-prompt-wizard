// Query Interface Component
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Sparkles, Database, Network, Brain } from 'lucide-react';

interface QueryInterfaceProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  integrationSettings: {
    ragEnabled: boolean;
    a2aEnabled: boolean;
    mcpEnabled: boolean;
    useAttachedAssets: boolean;
  };
  onIntegrationChange: (settings: any) => void;
  sampleQueries: string[];
}

export default function QueryInterface({
  query,
  onQueryChange,
  onSubmit,
  isProcessing,
  integrationSettings,
  onIntegrationChange,
  sampleQueries
}: QueryInterfaceProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          DeepSeek Query Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Query Input */}
        <div className="space-y-3">
          <Label htmlFor="query">Query</Label>
          <Textarea
            id="query"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Enter your question or prompt for DeepSeek..."
            className="min-h-[120px] resize-none"
            disabled={isProcessing}
          />
        </div>

        {/* Sample Queries */}
        <div className="space-y-3">
          <Label>Sample Queries</Label>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onQueryChange(sample)}
              >
                {sample.length > 50 ? `${sample.substring(0, 50)}...` : sample}
              </Badge>
            ))}
          </div>
        </div>

        {/* Integration Settings */}
        <div className="space-y-4">
          <Label>Integration Settings</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Switch
                id="rag-enabled"
                checked={integrationSettings.ragEnabled}
                onCheckedChange={(checked) => 
                  onIntegrationChange({ ...integrationSettings, ragEnabled: checked })
                }
                disabled={isProcessing}
              />
              <Label htmlFor="rag-enabled" className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                RAG 2.0 Enhanced
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="a2a-enabled"
                checked={integrationSettings.a2aEnabled}
                onCheckedChange={(checked) => 
                  onIntegrationChange({ ...integrationSettings, a2aEnabled: checked })
                }
                disabled={isProcessing}
              />
              <Label htmlFor="a2a-enabled" className="flex items-center gap-2">
                <Network className="h-4 w-4 text-green-500" />
                A2A Protocol
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="mcp-enabled"
                checked={integrationSettings.mcpEnabled}
                onCheckedChange={(checked) => 
                  onIntegrationChange({ ...integrationSettings, mcpEnabled: checked })
                }
                disabled={isProcessing}
              />
              <Label htmlFor="mcp-enabled" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                MCP Tools
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="assets-enabled"
                checked={integrationSettings.useAttachedAssets}
                onCheckedChange={(checked) => 
                  onIntegrationChange({ ...integrationSettings, useAttachedAssets: checked })
                }
                disabled={isProcessing}
              />
              <Label htmlFor="assets-enabled" className="flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-500" />
                Attached Assets
              </Label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={onSubmit}
          disabled={isProcessing || !query.trim()}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Processing with DeepSeek...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Submit Query
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}