import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Database, 
  FileText, 
  Clock, 
  Filter, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ragSystem, RAGQuery, RAGResponse } from '@/services/rag/ragSystem';
import { PlatformType, TechStack } from '@/types/ipa-types';

interface RAGInterfaceProps {
  onResultSelect?: (result: any) => void;
}

interface RAGStats {
  totalDocuments: number;
  totalChunks: number;
  vocabularySize: number;
  isIndexed: boolean;
}

export default function RAGInterface({ onResultSelect }: RAGInterfaceProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RAGResponse | null>(null);
  const [ragStats, setRagStats] = useState<RAGStats | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search filters
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | 'all'>('all');
  const [selectedTechStack, setSelectedTechStack] = useState<TechStack[]>([]);
  const [semanticWeight, setSemanticWeight] = useState(0.7);
  const [keywordWeight, setKeywordWeight] = useState(0.3);
  const [maxResults, setMaxResults] = useState(10);

  useEffect(() => {
    initializeRAG();
  }, []);

  const initializeRAG = async () => {
    if (isInitialized) return;
    
    setIsInitializing(true);
    setError(null);

    try {
      // Fetch platform data from API
      const response = await fetch('/api/platforms');
      if (!response.ok) {
        throw new Error('Failed to fetch platform data');
      }
      
      const platformsData = await response.json();
      console.log('Fetched platform data:', platformsData);

      // Initialize RAG system with platform data
      await ragSystem.initialize(platformsData);
      
      // Update stats
      const stats = ragSystem.getStats();
      setRagStats(stats);
      setIsInitialized(true);
      
      console.log('RAG system initialized successfully:', stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize RAG system';
      setError(errorMessage);
      console.error('RAG initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const performSearch = async () => {
    if (!query.trim() || !isInitialized) return;

    setIsSearching(true);
    setError(null);

    try {
      const searchQuery: RAGQuery = {
        query: query.trim(),
        filters: {
          platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
          techStack: selectedTechStack.length > 0 ? selectedTechStack : undefined
        },
        searchConfig: {
          semanticWeight,
          keywordWeight,
          maxResults,
          rerankResults: true
        }
      };

      console.log('Performing RAG search:', searchQuery);
      const results = await ragSystem.search(query, searchQuery);
      
      setSearchResults(results);
      console.log('Search results:', results);
      
      // Update stats after search
      const stats = ragSystem.getStats();
      setRagStats(stats);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      performSearch();
    }
  };

  const formatSearchTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'semantic': return 'bg-blue-100 text-blue-800';
      case 'keyword': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isInitializing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG 2.0 Vector Search
          </CardTitle>
          <CardDescription>
            Initializing advanced retrieval-augmented generation system...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-sm text-muted-foreground">
                Setting up vector embeddings and search index...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            RAG System Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={initializeRAG} 
            className="mt-4"
            disabled={isInitializing}
          >
            {isInitializing ? 'Retrying...' : 'Retry Initialization'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* RAG System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG 2.0 Vector Search System
            {isInitialized && (
              <Badge variant="secondary" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Advanced retrieval-augmented generation with hybrid search capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ragStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{ragStats.totalDocuments}</div>
                <div className="text-sm text-muted-foreground">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{ragStats.totalChunks}</div>
                <div className="text-sm text-muted-foreground">Chunks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{ragStats.vocabularySize}</div>
                <div className="text-sm text-muted-foreground">Vocabulary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {ragStats.isIndexed ? 'Ready' : 'Building'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Semantic Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="filters">Advanced Filters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Search knowledge base... (e.g., 'React components with real-time features')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[60px]"
                />
                <Button 
                  onClick={performSearch}
                  disabled={!query.trim() || isSearching || !isInitialized}
                  className="shrink-0"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as PlatformType | 'all')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="bolt">Bolt</SelectItem>
                      <SelectItem value="cursor">Cursor</SelectItem>
                      <SelectItem value="lovable">Lovable</SelectItem>
                      <SelectItem value="replit">Replit</SelectItem>
                      <SelectItem value="windsurf">Windsurf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Results</label>
                  <Select value={maxResults.toString()} onValueChange={(value) => setMaxResults(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select max results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Results</SelectItem>
                      <SelectItem value="10">10 Results</SelectItem>
                      <SelectItem value="20">20 Results</SelectItem>
                      <SelectItem value="50">50 Results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semantic Weight: {semanticWeight}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={semanticWeight}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      setSemanticWeight(newValue);
                      setKeywordWeight(1 - newValue);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Search Results
              <Badge variant="outline" className="ml-auto">
                {searchResults.results.length} results
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatSearchTime(searchResults.searchStats.searchTime)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {searchResults.searchStats.semanticResults} semantic + {searchResults.searchStats.keywordResults} keyword
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.results.map((result, index) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onResultSelect?.(result)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getMatchTypeColor(result.metadata.matchType)}>
                            {result.metadata.matchType}
                          </Badge>
                          {result.metadata.platform && (
                            <Badge variant="outline">
                              {result.metadata.platform}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {result.metadata.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {result.content.length > 300 
                            ? result.content.substring(0, 300) + '...'
                            : result.content
                          }
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Score: {(result.score * 100).toFixed(1)}%</span>
                          <span>Source: {result.source}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
                          #{index + 1}
                        </div>
                        <Progress 
                          value={result.score * 100} 
                          className="w-16 h-2 mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {searchResults.results.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No results found for your query.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or filters.
                  </p>
                </div>
              )}
            </div>
            
            {searchResults.suggestions && searchResults.suggestions.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Suggested searches:</h4>
                <div className="flex flex-wrap gap-2">
                  {searchResults.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery(suggestion);
                        performSearch();
                      }}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}