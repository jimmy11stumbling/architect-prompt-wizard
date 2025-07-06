import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Database, 
  Zap, 
  Settings,
  BarChart3,
  Clock,
  Target,
  Layers,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { ragService, RAG2SearchResponse, RAG2Result, RAGStats } from '@/services/rag/ragService';
import { realTimeResponseService } from '@/services/integration/realTimeResponseService';

interface RAG2InterfaceProps {
  onResultSelect?: (result: RAG2Result) => void;
}

export default function RAG2Interface({ onResultSelect }: RAG2InterfaceProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RAG2Result[]>([]);
  const [searchResponse, setSearchResponse] = useState<RAG2SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'uninitialized' | 'initializing' | 'ready' | 'indexing' | 'error'>('uninitialized');
  const [ragStats, setRagStats] = useState<RAGStats | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Search options
  const [filters, setFilters] = useState({
    category: 'all',
    platform: 'all',
    source: 'all',
    documentType: 'all'
  });
  const [searchOptions, setSearchOptions] = useState({
    limit: 10,
    semanticWeight: 70,
    keywordWeight: 30,
    rerankingEnabled: true,
    minSimilarity: 10
  });

  useEffect(() => {
    initializeRAG2System();
    loadRAGStats();
    
    // Listen for real-time updates
    const unsubscribe = realTimeResponseService.onUpdate((update) => {
      if (update.source === 'rag-service') {
        if (update.data?.stage === 'indexing-start') {
          setIsIndexing(true);
          setIndexingProgress(0);
        } else if (update.data?.stage === 'indexing-complete') {
          setIsIndexing(false);
          setIndexingProgress(100);
          loadRAGStats();
        }
      }
    });

    return unsubscribe;
  }, []);

  const initializeRAG2System = async () => {
    setSystemStatus('initializing');
    try {
      await ragService.initializeRAG2System();
      setSystemStatus('ready');
    } catch (error) {
      console.error('Failed to initialize RAG 2.0:', error);
      setSystemStatus('error');
    }
  };

  const loadRAGStats = async () => {
    try {
      const stats = await ragService.getRAGStats();
      setRagStats(stats);
    } catch (error) {
      console.error('Failed to load RAG stats:', error);
    }
  };

  const handleIndexData = async () => {
    setIsIndexing(true);
    setSystemStatus('indexing');
    try {
      const result = await ragService.indexAllData();
      if (result.success) {
        setSystemStatus('ready');
        await loadRAGStats();
      } else {
        setSystemStatus('error');
      }
    } catch (error) {
      console.error('Failed to index data:', error);
      setSystemStatus('error');
    } finally {
      setIsIndexing(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchResponse = await ragService.searchRAG2(query, {
        limit: searchOptions.limit,
        filters: Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value && value !== 'all')
        ),
        hybridWeight: {
          semantic: searchOptions.semanticWeight / 100,
          keyword: searchOptions.keywordWeight / 100
        },
        rerankingEnabled: searchOptions.rerankingEnabled
      });

      setSearchResponse(searchResponse);
      setResults(searchResponse.results);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQueryChange = async (value: string) => {
    setQuery(value);
    
    // Get suggestions for partial queries
    if (value.length > 2) {
      try {
        const newSuggestions = await ragService.getSuggestions(value);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const getStatusBadge = () => {
    switch (systemStatus) {
      case 'ready':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      case 'initializing':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Initializing</Badge>;
      case 'indexing':
        return <Badge variant="secondary"><Database className="h-3 w-3 mr-1" />Indexing</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline"><Info className="h-3 w-3 mr-1" />Uninitialized</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                RAG 2.0 Vector Search System
              </CardTitle>
              <CardDescription>
                Advanced retrieval-augmented generation with hybrid semantic and keyword search
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{ragStats?.documentsIndexed || 0}</div>
              <div className="text-sm text-muted-foreground">Documents Indexed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{ragStats?.chunksIndexed || 0}</div>
              <div className="text-sm text-muted-foreground">Chunks Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{ragStats?.embeddingStats?.size || 0}</div>
              <div className="text-sm text-muted-foreground">Vocabulary Size</div>
            </div>
          </div>
          
          {isIndexing && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Indexing in progress...</span>
              </div>
              <Progress value={indexingProgress} className="w-full" />
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleIndexData} 
              disabled={isIndexing || systemStatus === 'indexing'}
              size="sm"
            >
              <Database className="h-4 w-4 mr-2" />
              {ragStats?.documentsIndexed === 0 ? 'Initialize Index' : 'Reindex Data'}
            </Button>
            <Button onClick={loadRAGStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Interface */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Hybrid Vector Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Suggestions:</span>
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => setQuery(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="platform-specification">Platform Specs</SelectItem>
                    <SelectItem value="rag-specification">RAG Docs</SelectItem>
                    <SelectItem value="mcp-specification">MCP Docs</SelectItem>
                    <SelectItem value="a2a-specification">A2A Docs</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.platform} onValueChange={(value) => setFilters({...filters, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="cursor">Cursor</SelectItem>
                    <SelectItem value="bolt">Bolt</SelectItem>
                    <SelectItem value="replit">Replit</SelectItem>
                    <SelectItem value="windsurf">Windsurf</SelectItem>
                    <SelectItem value="lovable">Lovable</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.source} onValueChange={(value) => setFilters({...filters, source: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="attached-assets">Attached Assets</SelectItem>
                    <SelectItem value="platform-database">Platform DB</SelectItem>
                    <SelectItem value="knowledge-base">Knowledge Base</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.documentType} onValueChange={(value) => setFilters({...filters, documentType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="specification">Specifications</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="guide">Guides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search Results</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{searchResponse.totalResults} results</span>
                    <span>{searchResponse.searchTime}ms</span>
                  </div>
                </CardTitle>
                {searchResponse.searchStats && (
                  <CardDescription>
                    Semantic: {searchResponse.searchStats.semanticResults} • 
                    Keyword: {searchResponse.searchStats.keywordResults} • 
                    Reranked: {searchResponse.searchStats.rerankingApplied ? 'Yes' : 'No'}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {results.map((result, index) => (
                  <Card 
                    key={result.id} 
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onResultSelect?.(result)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{result.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          result.metadata.matchType === 'hybrid' ? 'default' :
                          result.metadata.matchType === 'semantic' ? 'secondary' : 'outline'
                        }>
                          {result.metadata.matchType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(result.relevanceScore * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {result.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{result.metadata.source}</span>
                      <span>{result.category}</span>
                      {result.metadata.wordCount && <span>{result.metadata.wordCount} words</span>}
                      {result.metadata.matchedTerms && result.metadata.matchedTerms.length > 0 && (
                        <div className="flex gap-1">
                          {result.metadata.matchedTerms.slice(0, 3).map((term, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {term}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                
                {results.length === 0 && !isSearching && (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found. Try adjusting your query or filters.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Result Limit</Label>
                  <Select value={searchOptions.limit.toString()} onValueChange={(value) => setSearchOptions({...searchOptions, limit: parseInt(value)})}>
                    <SelectTrigger className="w-full">
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

                <Separator />

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Hybrid Search Weights</Label>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Semantic Weight</span>
                        <span className="text-sm text-muted-foreground">{searchOptions.semanticWeight}%</span>
                      </div>
                      <Slider
                        value={[searchOptions.semanticWeight]}
                        onValueChange={([value]) => setSearchOptions({
                          ...searchOptions, 
                          semanticWeight: value,
                          keywordWeight: 100 - value
                        })}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Keyword Weight</span>
                        <span className="text-sm text-muted-foreground">{searchOptions.keywordWeight}%</span>
                      </div>
                      <Slider
                        value={[searchOptions.keywordWeight]}
                        onValueChange={([value]) => setSearchOptions({
                          ...searchOptions, 
                          keywordWeight: value,
                          semanticWeight: 100 - value
                        })}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="reranking" className="text-sm font-medium">Enable Reranking</Label>
                  <Switch
                    id="reranking"
                    checked={searchOptions.rerankingEnabled}
                    onCheckedChange={(checked) => setSearchOptions({...searchOptions, rerankingEnabled: checked})}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm font-medium">Minimum Similarity</Label>
                    <span className="text-sm text-muted-foreground">{searchOptions.minSimilarity}%</span>
                  </div>
                  <Slider
                    value={[searchOptions.minSimilarity]}
                    onValueChange={([value]) => setSearchOptions({...searchOptions, minSimilarity: value})}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ragStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Index Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Documents Indexed</span>
                        <span className="text-sm font-medium">{ragStats.documentsIndexed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Chunks Processed</span>
                        <span className="text-sm font-medium">{ragStats.chunksIndexed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Vocabulary Size</span>
                        <span className="text-sm font-medium">{ragStats.embeddingStats?.size || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Vector Store Size</span>
                        <span className="text-sm font-medium">{ragStats.vectorStoreStats?.indexSize || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">System Health</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vector Store</span>
                        <Badge variant={ragStats.vectorStoreStats?.totalDocuments > 0 ? "default" : "secondary"}>
                          {ragStats.vectorStoreStats?.totalDocuments > 0 ? "Operational" : "Empty"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Embedding Service</span>
                        <Badge variant={ragStats.embeddingStats?.size > 0 ? "default" : "secondary"}>
                          {ragStats.embeddingStats?.size > 0 ? "Ready" : "Not Ready"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Indexed</span>
                        <span className="text-sm text-muted-foreground">
                          {ragStats.lastIndexed ? new Date(ragStats.lastIndexed).toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No analytics data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}