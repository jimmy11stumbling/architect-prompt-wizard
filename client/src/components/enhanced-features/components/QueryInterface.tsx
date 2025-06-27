
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Database, Network, Settings } from "lucide-react";

interface QueryInterfaceProps {
  query: string;
  setQuery: (query: string) => void;
  loading: boolean;
  progress: number;
  useRag: boolean;
  setUseRag: (use: boolean) => void;
  useA2A: boolean;
  setUseA2A: (use: boolean) => void;
  useMCP: boolean;
  setUseMCP: (use: boolean) => void;
  onExecute: () => void;
  onClear: () => void;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
  query,
  setQuery,
  loading,
  progress,
  useRag,
  setUseRag,
  useA2A,
  setUseA2A,
  useMCP,
  setUseMCP,
  onExecute,
  onClear
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Enhanced AI Query Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Enter your query here... (RAG, A2A, and MCP will be integrated automatically)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="use-rag"
              checked={useRag}
              onCheckedChange={setUseRag}
            />
            <Label htmlFor="use-rag" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              RAG 2.0
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="use-a2a"
              checked={useA2A}
              onCheckedChange={setUseA2A}
            />
            <Label htmlFor="use-a2a" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              A2A Protocol
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="use-mcp"
              checked={useMCP}
              onCheckedChange={setUseMCP}
            />
            <Label htmlFor="use-mcp" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              MCP Hub
            </Label>
          </div>
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing enhanced query...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="text-xs text-muted-foreground">
              {progress < 30 && "Initializing services..."}
              {progress >= 30 && progress < 60 && "Querying RAG database..."}
              {progress >= 60 && progress < 80 && "Coordinating with agents..."}
              {progress >= 80 && progress < 95 && "Processing with DeepSeek..."}
              {progress >= 95 && "Finalizing response..."}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={onExecute}
            disabled={loading || !query.trim()}
            className="flex-1"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Process Enhanced Query
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
        </div>

        {/* Sample queries for testing */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Sample Queries:</div>
          <div className="flex flex-wrap gap-2">
            {[
              "How does RAG 2.0 improve upon traditional RAG systems?",
              "Explain A2A agent coordination patterns",
              "What are the benefits of MCP protocol integration?",
              "Compare vector database solutions for RAG",
              "How to implement hybrid search in production?"
            ].map((sample, index) => (
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
