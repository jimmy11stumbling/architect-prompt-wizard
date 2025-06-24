
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Database, Search, FileText, Clock, Zap } from "lucide-react";
import { RAGQuery, RAGResult } from "@/types/ipa-types";
import { useToast } from "@/hooks/use-toast";

const RAGQueryInterface: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RAGResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryHistory, setQueryHistory] = useState<Array<{ query: string; timestamp: number }>>([]);
  const [settings, setSettings] = useState({
    limit: 5,
    threshold: 0.3,
    searchType: "hybrid"
  });
  const { toast } = useToast();

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setIsQuerying(true);
    try {
      // Simulate RAG query
      const ragQuery: RAGQuery = {
        query: query.trim(),
        limit: settings.limit,
        threshold: settings.threshold
      };

      // Mock RAG results for now
      const mockResults: RAGResult = {
        documents: [
          {
            id: "doc-1",
            title: "RAG 2.0 Implementation Guide",
            content: "Advanced retrieval-augmented generation techniques for modern AI applications...",
            source: "technical-docs",
            metadata: { category: "implementation", priority: "high" }
          },
          {
            id: "doc-2", 
            title: "MCP Protocol Specification",
            content: "Model Context Protocol standards and implementation details...",
            source: "specifications",
            metadata: { category: "protocol", priority: "medium" }
          },
          {
            id: "doc-3",
            title: "A2A Communication Patterns",
            content: "Agent-to-agent communication protocols and best practices...",
            source: "architecture-docs",
            metadata: { category: "architecture", priority: "high" }
          }
        ],
        query: ragQuery.query,
        totalResults: 3,
        scores: [0.95, 0.87, 0.82],
        searchTime: Math.random() * 500 + 100
      };

      setTimeout(() => {
        setResults(mockResults);
        setQueryHistory(prev => [...prev, { query: query.trim(), timestamp: Date.now() }]);
        setIsQuerying(false);
        
        toast({
          title: "Query Complete",
          description: `Found ${mockResults.documents.length} relevant documents`
        });
      }, 1000);

    } catch (error) {
      console.error("RAG query failed:", error);
      setIsQuerying(false);
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const sampleQueries = [
    "How to implement RAG 2.0 with vector databases?",
    "MCP protocol integration best practices",
    "A2A agent coordination patterns",
    "DeepSeek reasoning optimization techniques"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG 2.0 Query Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rag-query">Search Query</Label>
            <Textarea
              id="rag-query"
              placeholder="Enter your search query to retrieve relevant context from the RAG database..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Result Limit</Label>
              <Input
                id="limit"
                type="number"
                value={settings.limit}
                onChange={(e) => setSettings(prev => ({ ...prev, limit: parseInt(e.target.value) || 5 }))}
                min={1}
                max={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Similarity Threshold</Label>
              <Input
                id="threshold"
                type="number"
                step="0.1"
                value={settings.threshold}
                onChange={(e) => setSettings(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0.3 }))}
                min={0}
                max={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Search Type</Label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={settings.searchType}
                onChange={(e) => setSettings(prev => ({ ...prev, searchType: e.target.value }))}
              >
                <option value="hybrid">Hybrid Search</option>
                <option value="semantic">Semantic Only</option>
                <option value="keyword">Keyword Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={executeQuery} 
              disabled={isQuerying || !query.trim()}
              className="flex-1"
            >
              {isQuerying ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Searching RAG Database...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Execute Query
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Sample Queries:</Label>
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

      {isQuerying && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Processing query...</span>
                <Zap className="h-4 w-4 animate-pulse text-blue-500" />
              </div>
              <Progress value={65} className="w-full" />
              <div className="text-xs text-muted-foreground">
                Searching vector embeddings and applying semantic filters...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results">Search Results</TabsTrigger>
            <TabsTrigger value="metrics">Query Metrics</TabsTrigger>
            <TabsTrigger value="history">Query History</TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Search Results
                  <Badge variant="outline">
                    {results.documents.length} documents found
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.documents.map((doc, index) => (
                  <div key={doc.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          Score: {results.scores[index].toFixed(2)}
                        </Badge>
                        <Badge variant="outline">
                          {doc.source}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {doc.content}
                    </p>
                    {doc.metadata && (
                      <div className="flex gap-1">
                        {Object.entries(doc.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {results.searchTime?.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Search Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {results.documents.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Documents Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {Math.max(...results.scores).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Best Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {(results.scores.reduce((a, b) => a + b, 0) / results.scores.length).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Query History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {queryHistory.slice(-10).reverse().map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{item.query}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {queryHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No query history yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RAGQueryInterface;
