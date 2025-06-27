
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Brain, Send, History, Database, Network, Wrench } from "lucide-react";

interface QueryInterfaceProps {
  query: string;
  setQuery: (query: string) => void;
  isProcessing: boolean;
  integrationSettings: {
    ragEnabled: boolean;
    a2aEnabled: boolean;
    mcpEnabled: boolean;
  };
  setIntegrationSettings: React.Dispatch<React.SetStateAction<{
    ragEnabled: boolean;
    a2aEnabled: boolean;
    mcpEnabled: boolean;
  }>>;
  onProcessQuery: () => void;
  onClearConversation: () => void;
  currentConversationId: string | null;
  onKeyPress: (e: React.KeyboardEvent) => void;
  sampleQueries: string[];
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
  query,
  setQuery,
  isProcessing,
  integrationSettings,
  setIntegrationSettings,
  onProcessQuery,
  onClearConversation,
  currentConversationId,
  onKeyPress,
  sampleQueries
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          DeepSeek Reasoner Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="query">Your Question or Prompt</Label>
          <Textarea
            id="query"
            placeholder="Ask me anything about AI systems, RAG, A2A protocols, or MCP integration..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={onKeyPress}
            rows={4}
          />
          <div className="text-xs text-muted-foreground">
            Press Ctrl+Enter to submit
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-sm">RAG 2.0</span>
            </div>
            <Switch
              checked={integrationSettings.ragEnabled}
              onCheckedChange={(checked) => 
                setIntegrationSettings(prev => ({ ...prev, ragEnabled: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-green-500" />
              <span className="text-sm">A2A Protocol</span>
            </div>
            <Switch
              checked={integrationSettings.a2aEnabled}
              onCheckedChange={(checked) => 
                setIntegrationSettings(prev => ({ ...prev, a2aEnabled: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-500" />
              <span className="text-sm">MCP Tools</span>
            </div>
            <Switch
              checked={integrationSettings.mcpEnabled}
              onCheckedChange={(checked) => 
                setIntegrationSettings(prev => ({ ...prev, mcpEnabled: checked }))
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={onProcessQuery} 
            disabled={isProcessing || !query.trim()}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Processing with Chain-of-Thought...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Process Query
              </>
            )}
          </Button>
          
          {currentConversationId && (
            <Button onClick={onClearConversation} variant="outline">
              <History className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foregoing">Sample Questions:</Label>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(sample)}
                className="text-xs"
              >
                {sample}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueryInterface;
