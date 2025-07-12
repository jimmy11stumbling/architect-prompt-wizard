
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Brain, Send, History, Database, Network, Wrench, Zap, Activity, FileText } from "lucide-react";

interface QueryInterfaceProps {
  query: string;
  setQuery: (query: string) => void;
  isProcessing: boolean;
  integrationSettings: {
    ragEnabled: boolean;
    a2aEnabled: boolean;
    mcpEnabled: boolean;
    useAttachedAssets: boolean;
  };
  onIntegrationSettingsChange: React.Dispatch<React.SetStateAction<{
    ragEnabled: boolean;
    a2aEnabled: boolean;
    mcpEnabled: boolean;
    useAttachedAssets: boolean;
  }>>;
  onProcessQuery: () => void;
  onClearConversation: () => void;
  onContinueConversation: (conversationId: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  sampleQueries: string[];
  streamingMode?: boolean;
  onStreamingModeChange?: (enabled: boolean) => void;
  isStreaming?: boolean;
  currentConversationId?: string | null;
  ragStats?: {
    documentsIndexed: number;
    chunksIndexed: number;
    lastUpdated: Date | null;
  };
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
  query,
  setQuery,
  isProcessing,
  integrationSettings,
  onIntegrationSettingsChange,
  onProcessQuery,
  onClearConversation,
  onContinueConversation,
  onKeyPress,
  sampleQueries,
  streamingMode = false,
  onStreamingModeChange,
  isStreaming = false,
  currentConversationId = null,
  ragStats
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
            placeholder="Ask me anything about no-code platforms (Cursor, Bolt, Lovable, Replit, Windsurf), RAG 2.0 vector search, MCP tool integration, A2A agent coordination, or advanced AI development techniques..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={onKeyPress}
            rows={4}
          />
          <div className="text-xs text-muted-foreground">
            Press Ctrl+Enter to submit
          </div>
        </div>

        {/* Streaming Mode Toggle */}
        {onStreamingModeChange && (
          <div className="flex items-center justify-between p-3 from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border bg-[#2b3244] text-[#fcfcfc]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {streamingMode ? (
                  <Activity className="h-4 w-4 text-blue-500" />
                ) : (
                  <Zap className="h-4 w-4 text-purple-500" />
                )}
                <span className="font-medium text-sm">
                  {streamingMode ? "Real-time Streaming" : "Batch Processing"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {streamingMode ? "Live token-by-token response" : "Complete response at once"}
              </div>
            </div>
            <Switch
              checked={streamingMode}
              onCheckedChange={onStreamingModeChange}
              disabled={isStreaming}
            />
          </div>
        )}

        {/* Comprehensive Document Access Indicator */}
        {integrationSettings.ragEnabled && (
          <div className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-green-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-blue-900 dark:text-blue-100">COMPLETE KNOWLEDGE BASE ACCESS</span>
              <div className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-medium">
                <Activity className="h-3 w-3" />
                FULLY INTEGRATED
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded">
                <div className="font-semibold text-blue-800 dark:text-blue-200">RAG 2.0 Vector Search</div>
                <div className="text-xs text-muted-foreground">Semantic + Keyword Hybrid Search</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded">
                <div className="font-semibold text-purple-800 dark:text-purple-200">MCP Tool Integration</div>
                <div className="text-xs text-muted-foreground">Model Context Protocol Access</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded">
                <div className="font-semibold text-green-800 dark:text-green-200">A2A Multi-Agent</div>
                <div className="text-xs text-muted-foreground">Agent-to-Agent Coordination</div>
              </div>
            </div>
            
            <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              📚 <span className="font-bold">{ragStats?.documentsIndexed?.toLocaleString() || '6,800+'} Documents</span> • 
              🔍 <span className="font-bold">{ragStats?.chunksIndexed?.toLocaleString() || '48,720+'} Searchable Chunks</span> • 
              🤖 <span className="font-bold">12 Specialized Agents</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Complete Platform Coverage:</span> Cursor, Bolt, Lovable, Replit, Windsurf • 
              <span className="font-medium">Advanced Systems:</span> RAG 2.0, MCP Tools, A2A Protocols • 
              <span className="font-medium">Live Data:</span> Attached assets, real-time system integration
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-sm">RAG 2.0</span>
            </div>
            <Switch
              checked={integrationSettings.ragEnabled}
              onCheckedChange={(checked) => 
                onIntegrationSettingsChange(prev => ({ ...prev, ragEnabled: checked }))
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
                onIntegrationSettingsChange(prev => ({ ...prev, a2aEnabled: checked }))
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
                onIntegrationSettingsChange(prev => ({ ...prev, mcpEnabled: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Attached Assets</span>
            </div>
            <Switch
              checked={integrationSettings.useAttachedAssets}
              onCheckedChange={(checked) => 
                onIntegrationSettingsChange(prev => ({ ...prev, useAttachedAssets: checked }))
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
            {sampleQueries.concat([
              "Compare Cursor vs Bolt for React development",
              "How to implement RAG 2.0 with vector databases?",
              "What are MCP tools and how do they integrate?",
              "Best practices for A2A agent coordination",
              "Lovable vs Windsurf deployment options",
              "Platform-specific authentication methods"
            ]).map((sample, index) => (
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
