import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Search, 
  Brain, 
  Network, 
  Database,
  FileText,
  Zap,
  Loader,
  CheckCircle,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API service for advanced MCP tools
const mcpToolsAPI = {
  async semanticSearch(query: string, categories: string[] = [], maxResults: number = 5) {
    const response = await fetch('/api/mcp-tools/semantic-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, categories, maxResults, includeContent: true })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async analyzeDocument(filename: string, analysisType: string = 'summary') {
    const response = await fetch('/api/mcp-tools/analyze-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, analysisType })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async buildKnowledgeGraph(categories: string[] = [], includeRelationships: boolean = true) {
    const response = await fetch('/api/mcp-tools/build-knowledge-graph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories, includeRelationships })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async extractContent(filenames: string[], extractionType: string = 'excerpt', maxLength: number = 1000) {
    const response = await fetch('/api/mcp-tools/extract-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames, extractionType, maxLength })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async getAssetsByCategory(category: string) {
    const response = await fetch(`/api/mcp-hub/category/${category}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
};

const MCPAdvancedInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [analysisTarget, setAnalysisTarget] = useState("");
  const [extractionTargets, setExtractionTargets] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);
  const [extractedContent, setExtractedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const { toast } = useToast();

  const categories = ['mcp', 'rag', 'a2a', 'cursor', 'bolt', 'replit', 'windsurf', 'lovable', 'general'];

  useEffect(() => {
    loadAvailableAssets();
  }, []);

  const loadAvailableAssets = async () => {
    try {
      const mcpAssets = await mcpToolsAPI.getAssetsByCategory('mcp');
      setAvailableAssets(mcpAssets.slice(0, 10)); // Show first 10 for demo
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await mcpToolsAPI.semanticSearch(searchQuery, selectedCategories, 5);
      setSearchResults(results);
      
      toast({
        title: "Semantic Search Complete",
        description: `Found ${results.relevantAssets.length} relevant assets`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentAnalysis = async () => {
    if (!analysisTarget) return;
    
    setIsLoading(true);
    try {
      const results = await mcpToolsAPI.analyzeDocument(analysisTarget, 'summary');
      setAnalysisResults(results);
      
      toast({
        title: "Document Analysis Complete",
        description: `Analyzed ${analysisTarget}`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKnowledgeGraphGeneration = async () => {
    setIsLoading(true);
    try {
      const results = await mcpToolsAPI.buildKnowledgeGraph(selectedCategories, true);
      setKnowledgeGraph(results);
      
      toast({
        title: "Knowledge Graph Generated",
        description: `Created graph with ${results.statistics.totalNodes} nodes and ${results.statistics.totalRelationships} relationships`,
      });
    } catch (error) {
      toast({
        title: "Knowledge Graph Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentExtraction = async () => {
    if (extractionTargets.length === 0) return;
    
    setIsLoading(true);
    try {
      const results = await mcpToolsAPI.extractContent(extractionTargets, 'summary', 1000);
      setExtractedContent(results);
      
      toast({
        title: "Content Extraction Complete",
        description: `Extracted content from ${results.metadata.successfulExtractions}/${results.metadata.totalFiles} files`,
      });
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleExtractionTarget = (filename: string) => {
    setExtractionTargets(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Advanced MCP Tools Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Advanced Model Context Protocol tools for semantic search, document analysis, 
            knowledge graph generation, and intelligent content extraction.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="semantic-search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="semantic-search">Semantic Search</TabsTrigger>
          <TabsTrigger value="analysis">Document Analysis</TabsTrigger>
          <TabsTrigger value="knowledge-graph">Knowledge Graph</TabsTrigger>
          <TabsTrigger value="extraction">Content Extraction</TabsTrigger>
        </TabsList>

        {/* Semantic Search Tab */}
        <TabsContent value="semantic-search" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Query</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter semantic search query..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSemanticSearch()}
                    />
                    <Button onClick={handleSemanticSearch} disabled={isLoading}>
                      {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant={selectedCategories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Search Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {searchResults ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Found {searchResults.relevantAssets.length} relevant assets
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.relevantAssets.map((asset: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">{asset.filename}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Category: {asset.metadata?.category} | 
                            Relevance: {((asset.metadata?.relevanceScore || 0) * 100).toFixed(1)}%
                          </div>
                          {asset.metadata?.description && (
                            <div className="text-xs mt-2">{asset.metadata.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No search results yet. Enter a query and click search.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Document Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Analysis Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Document</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={analysisTarget}
                    onChange={(e) => setAnalysisTarget(e.target.value)}
                  >
                    <option value="">Choose a document...</option>
                    {availableAssets.map(asset => (
                      <option key={asset.filename} value={asset.filename}>
                        {asset.filename}
                      </option>
                    ))}
                  </select>
                </div>

                <Button 
                  onClick={handleDocumentAnalysis} 
                  disabled={!analysisTarget || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                  Analyze Document
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResults ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <div className="text-lg font-bold text-blue-500">{analysisResults.statistics.wordCount}</div>
                        <div className="text-xs text-muted-foreground">Words</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <div className="text-lg font-bold text-green-500">{analysisResults.statistics.estimatedReadTime}m</div>
                        <div className="text-xs text-muted-foreground">Read Time</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Keywords</div>
                      <div className="flex flex-wrap gap-1">
                        {analysisResults.keywords.slice(0, 8).map((keyword: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {analysisResults.summary && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Summary</div>
                        <div className="text-xs text-muted-foreground p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          {analysisResults.summary}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No analysis results yet. Select a document and analyze.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Knowledge Graph Tab */}
        <TabsContent value="knowledge-graph" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Graph Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Include Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant={selectedCategories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleKnowledgeGraphGeneration} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Network className="h-4 w-4 mr-2" />}
                  Generate Knowledge Graph
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Graph Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {knowledgeGraph ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                        <div className="text-lg font-bold text-purple-500">{knowledgeGraph.statistics.totalNodes}</div>
                        <div className="text-xs text-muted-foreground">Nodes</div>
                      </div>
                      <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                        <div className="text-lg font-bold text-orange-500">{knowledgeGraph.statistics.totalRelationships}</div>
                        <div className="text-xs text-muted-foreground">Relations</div>
                      </div>
                      <div className="text-center p-3 bg-cyan-500/10 rounded-lg">
                        <div className="text-lg font-bold text-cyan-500">{knowledgeGraph.statistics.categories.length}</div>
                        <div className="text-xs text-muted-foreground">Categories</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Categories in Graph</div>
                      <div className="flex flex-wrap gap-1">
                        {knowledgeGraph.statistics.categories.map((category: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No knowledge graph generated yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Extraction Tab */}
        <TabsContent value="extraction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Extraction Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Documents</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {availableAssets.map(asset => (
                      <div
                        key={asset.filename}
                        className={`p-2 rounded cursor-pointer text-sm ${
                          extractionTargets.includes(asset.filename)
                            ? 'bg-blue-500/20 border-blue-500/30'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => toggleExtractionTarget(asset.filename)}
                      >
                        <div className="flex items-center gap-2">
                          {extractionTargets.includes(asset.filename) ? (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                          <span className="font-medium">{asset.filename}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleContentExtraction} 
                  disabled={extractionTargets.length === 0 || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                  Extract Content ({extractionTargets.length} selected)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Extraction Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {extractedContent ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Successfully extracted from {extractedContent.metadata.successfulExtractions} of {extractedContent.metadata.totalFiles} files
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {Object.entries(extractedContent.extractedContent).map(([filename, data]: [string, any]) => (
                        <div key={filename} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">{filename}</div>
                          {data.error ? (
                            <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {data.error}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              {data.content.substring(0, 200)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No content extracted yet. Select documents and extract.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MCPAdvancedInterface;