import React, { useState, useEffect } from "react";
import { Search, Filter, BarChart3, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  document: {
    id: string;
    content: string;
    metadata: {
      source: string;
      platform?: string;
      category?: string;
      chunkIndex?: number;
      totalChunks?: number;
    };
  };
  similarity: number;
  rank: number;
}

interface RAGResponse {
  query: string;
  results: SearchResult[];
  context: string;
  totalResults: number;
  searchTime: number;
  sources: string[];
}

interface RAGStats {
  totalDocuments: number;
  categoryCounts: Record<string, number>;
  platformCounts: Record<string, number>;
}

export const RAGSearchInterface: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RAGResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [filters, setFilters] = useState({
    platform: "",
    category: "",
    maxResults: "10"
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/rag/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setIsInitialized(data.totalDocuments > 0);
      }
    } catch (error) {
      console.error("Error fetching RAG stats:", error);
    }
  };

  const initializeRAG = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/rag/initialize", { method: "POST" });
      if (response.ok) {
        toast({
          title: "RAG System Initialized",
          description: "Vector search system is ready for use"
        });
        setIsInitialized(true);
        fetchStats();
      } else {
        throw new Error("Failed to initialize RAG");
      }
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const indexData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/rag/index", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Indexing Completed",
          description: `Successfully indexed platform data with progress tracking`
        });
        fetchStats();
        setIsInitialized(true);
      } else {
        throw new Error("Failed to index data");
      }
    } catch (error) {
      toast({
        title: "Indexing Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          filters: filters.platform || filters.category ? {
            platform: filters.platform || undefined,
            category: filters.category || undefined
          } : undefined,
          maxResults: parseInt(filters.maxResults)
        })
      });

      if (response.ok) {
        const data: RAGResponse = await response.json();
        setResults(data);
        toast({
          title: "Search Completed",
          description: `Found ${data.totalResults} results in ${data.searchTime}ms`
        });
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/rag/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    getSuggestions(value);
  };

  if (!isInitialized) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              RAG 2.0 Vector Search System
            </CardTitle>
            <CardDescription>
              Initialize the Retrieval-Augmented Generation system to enable advanced knowledge search
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={initializeRAG} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Initialize RAG System
              </Button>
              <Button 
                onClick={indexData} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Index Platform Data
              </Button>
            </div>
            
            {stats && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                    <div className="text-sm text-muted-foreground">Documents</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{Object.keys(stats.platformCounts).length}</div>
                    <div className="text-sm text-muted-foreground">Platforms</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{Object.keys(stats.categoryCounts).length}</div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            RAG 2.0 Vector Search
          </CardTitle>
          <CardDescription>
            Search through platform knowledge using hybrid vector and keyword search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Input
                placeholder="Search platforms, features, capabilities..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && performSearch()}
                className="pr-12"
              />
              <Button
                size="sm"
                onClick={performSearch}
                disabled={loading || !query.trim()}
                className="absolute right-1 top-1"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setQuery(suggestion);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <Select value={filters.platform} onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Platforms</SelectItem>
                  {stats && Object.keys(stats.platformCounts).map(platform => (
                    <SelectItem key={platform} value={platform}>
                      {platform} ({stats.platformCounts[platform]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {stats && Object.keys(stats.categoryCounts).map(category => (
                    <SelectItem key={category} value={category}>
                      {category} ({stats.categoryCounts[category]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.maxResults} onValueChange={(value) => setFilters(prev => ({ ...prev, maxResults: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 results</SelectItem>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="20">20 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Search Results ({results.totalResults})</TabsTrigger>
            <TabsTrigger value="context">Generated Context</TabsTrigger>
            <TabsTrigger value="sources">Sources ({results.sources.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {results.results.map((result, index) => (
              <Card key={result.document.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {result.document.metadata.platform || "Unknown Platform"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary">{result.document.metadata.category}</Badge>
                        <span>Relevance: {(result.similarity * 100).toFixed(1)}%</span>
                        <span>Rank: #{result.rank}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{result.document.content}</p>
                  {result.document.metadata.chunkIndex !== undefined && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Chunk {result.document.metadata.chunkIndex + 1} of {result.document.metadata.totalChunks}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="context">
            <Card>
              <CardHeader>
                <CardTitle>Generated Context</CardTitle>
                <CardDescription>
                  Compiled context from search results for AI model consumption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {results.context}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Information Sources</CardTitle>
                <CardDescription>
                  Original sources used in this search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.sources.map((source, index) => (
                    <Badge key={index} variant="outline">
                      {source}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Stats Panel */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                <div className="text-sm text-muted-foreground">Total Documents</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(stats.platformCounts).length}</div>
                <div className="text-sm text-muted-foreground">Platforms Indexed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(stats.categoryCounts).length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{results?.searchTime || 0}ms</div>
                <div className="text-sm text-muted-foreground">Last Search Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};