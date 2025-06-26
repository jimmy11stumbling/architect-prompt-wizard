
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Database, Search, FileText, Clock, Zap, Brain, Layers, Settings } from "lucide-react";
import { RAGQuery } from "@/services/rag/ragService";
import { AdvancedRAGResponse } from "@/services/rag/advancedRagService";
import { useToast } from "@/hooks/use-toast";

interface RAGResultDisplay {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    source: string;
    score: number;
    metadata?: Record<string, any>;
  }>;
  query: string;
  totalResults: number;
  scores: number[];
  searchTime: number;
  compressedContext?: any;
  searchExplanation?: string;
  processingStats?: any;
}

const RAGQueryInterface: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RAGResultDisplay | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryHistory, setQueryHistory] = useState<Array<{ query: string; timestamp: number }>>([]);
  const [settings, setSettings] = useState({
    limit: 5,
    threshold: 0.3,
    searchType: "hybrid",
    useCompression: true,
    useAdvancedFeatures: true
  });
  const [searchWeights, setSearchWeights] = useState({
    semantic: 0.6,
    keyword: 0.3,
    recency: 0.05,
    structure: 0.05
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
      console.log("Executing advanced RAG query:", query);
      
      const ragQuery: RAGQuery = {
        query: query.trim(),
        limit: settings.limit,
        threshold: settings.threshold
      };

      let ragResponse: AdvancedRAGResponse;

      if (settings.useAdvancedFeatures) {
        // Use advanced RAG service
        const { advancedRagService } = await import("@/services/rag/advancedRagService");
        ragResponse = await advancedRagService.query(ragQuery, settings.useCompression);
      } else {
        // Fallback to basic RAG service
        const { ragService } = await import("@/services/rag/ragService");
        const basicResponse = await ragService.query(ragQuery);
        ragResponse = {
          ...basicResponse,
          searchExplanation: `Basic search found ${basicResponse.results.length} results`,
          processingStats: {
            chunksProcessed: basicResponse.results.length,
            searchTime: basicResponse.processingTime,
            compressionTime: 0,
            totalProcessingTime: basicResponse.processingTime
          }
        };
      }
      
      // Convert to display format
      const ragResult: RAGResultDisplay = {
        documents: ragResponse.results.map((result, index) => ({
          id: result.id,
          title: result.title,
          content: result.content,
          source: result.category,
          score: result.relevanceScore,
          metadata: result.metadata
        })),
        query: ragQuery.query,
        totalResults: ragResponse.totalResults,
        scores: ragResponse.scores,
        searchTime: ragResponse.searchTime,
        compressedContext: ragResponse.compressedContext,
        searchExplanation: ragResponse.searchExplanation,
        processingStats: ragResponse.processingStats
      };

      console.log("Advanced RAG query result:", ragResult);
      
      setResults(ragResult);
      setQueryHistory(prev => [...prev, { query: query.trim(), timestamp: Date.now() }]);
      
      toast({
        title: "Query Complete",
        description: `Found ${ragResult.documents.length} relevant documents using ${settings.useAdvancedFeatures ? 'advanced' : 'basic'} RAG`
      });

    } catch (error) {
      console.error("RAG query failed:", error);
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const updateSearchWeights = async () => {
    if (settings.useAdvancedFeatures) {
      try {
        const { advancedRagService } = await import("@/services/rag/advancedRagService");
        await advancedRagService.updateSearchWeights(searchWeights);
        toast({
          title: "Search Weights Updated",
          description: "Advanced search parameters have been updated"
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "Failed to update search weights",
          variant: "destructive"
        });
      }
    }
  };

  const sampleQueries = [
    "How to implement RAG 2.0 with vector databases?",
    "What are the key differences between Pinecone and Weaviate?",
    "Explain MCP protocol implementation best practices",
    "How do A2A agent coordination patterns work?",
    "Compare hybrid search vs semantic search performance",
    "What are the security considerations for agent communication?"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Advanced RAG 2.0 Query Interface
            {settings.useAdvancedFeatures && (
              <Badge variant="default" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                Advanced
              </Badge>
            )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Advanced Features
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.useAdvancedFeatures}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, useAdvancedFeatures: checked }))}
                />
                <span className="text-sm text-muted-foreground">
                  {settings.useAdvancedFeatures ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {settings.useAdvancedFeatures && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Label className="font-medium">Advanced Settings</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.useCompression}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, useCompression: checked }))}
                />
                <Label>Context Compression</Label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Semantic Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={searchWeights.semantic}
                    onChange={(e) => setSearchWeights(prev => ({ ...prev, semantic: parseFloat(e.target.value) || 0 }))}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Keyword Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={searchWeights.keyword}
                    onChange={(e) => setSearchWeights(prev => ({ ...prev, keyword: parseFloat(e.target.value) || 0 }))}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Recency Weight</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={searchWeights.recency}
                    onChange={(e) => setSearchWeights(prev => ({ ...prev, recency: parseFloat(e.target.value) || 0 }))}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Structure Weight</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={searchWeights.structure}
                    onChange={(e) => setSearchWeights(prev => ({ ...prev, structure: parseFloat(e.target.value) || 0 }))}
                    className="h-8"
                  />
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={updateSearchWeights}>
                Update Search Weights
              </Button>
            </div>
          )}

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
                {settings.useAdvancedFeatures 
                  ? "Using hybrid search with semantic similarity and keyword matching..."
                  : "Searching vector embeddings and applying filters..."
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results">Search Results</TabsTrigger>
            <TabsTrigger value="compressed">Compressed Context</TabsTrigger>
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
                {results.searchExplanation && (
                  <p className="text-sm text-muted-foreground">
                    {results.searchExplanation}
                  </p>
                )}
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
                          Score: {doc.score.toFixed(3)}
                        </Badge>
                        <Badge variant="outline">
                          {doc.source}
                        </Badge>
                        {doc.metadata?.searchType && (
                          <Badge variant="outline" className="text-xs">
                            {doc.metadata.searchType}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {doc.content}
                    </p>
                    {doc.metadata?.explanation && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Match reason: {doc.metadata.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compressed">
            <Card>
              <CardHeader>
                <CardTitle>Compressed Context</CardTitle>
              </CardHeader>
              <CardContent>
                {results.compressedContext ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {(results.compressedContext.compressionRatio * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Compression Ratio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">
                          {results.compressedContext.keyPoints?.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Key Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">
                          {(results.compressedContext.relevanceScore * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Relevance Score</div>
                      </div>
                    </div>
                    
                    {results.compressedContext.keyPoints && results.compressedContext.keyPoints.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Points:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {results.compressedContext.keyPoints.map((point: string, index: number) => (
                            <li key={index} className="text-sm">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2">Compressed Text:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                        {results.compressedContext.compressedText}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Context compression not available. Enable advanced features to use this functionality.
                  </div>
                )}
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
                      {Math.max(...results.scores).toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">Best Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {(results.scores.reduce((a, b) => a + b, 0) / results.scores.length).toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                </div>
                
                {results.processingStats && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-500">
                        {results.processingStats.chunksProcessed}
                      </div>
                      <div className="text-sm text-muted-foreground">Chunks Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-teal-500">
                        {results.processingStats.compressionTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Compression Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-rose-500">
                        {results.processingStats.totalProcessingTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Total Processing</div>
                    </div>
                  </div>
                )}
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
