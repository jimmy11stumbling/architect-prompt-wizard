import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  Search, 
  FileText, 
  Zap, 
  Brain,
  RefreshCw,
  Play,
  Code,
  Network
} from "lucide-react";
// API service functions
const apiService = {
  async getStats() {
    const response = await fetch('/api/mcp-hub/stats');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
  
  async getCategories() {
    const response = await fetch('/api/mcp-hub/categories');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
  
  async getResources() {
    const response = await fetch('/api/mcp-hub/mcp/resources');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
  
  async getContextForPrompt(query: string, maxAssets: number) {
    const response = await fetch('/api/mcp-hub/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, maxAssets, includeContent: true })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
  
  async getMCPContext() {
    const response = await fetch('/api/mcp-hub/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: "MCP Model Context Protocol implementation guide",
        maxAssets: 3,
        includeContent: true
      })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
};
import { useToast } from "@/hooks/use-toast";

const MCPHubDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contextResult, setContextResult] = useState<string>("");
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    initializeMCPHub();
  }, []);

  const initializeMCPHub = async () => {
    setIsLoading(true);
    try {
      // Load initial data
      const [statsData, categoriesData, resourcesData] = await Promise.all([
        apiService.getStats(),
        apiService.getCategories(),
        apiService.getResources()
      ]);
      
      setStats(statsData);
      setCategories(categoriesData);
      setResources(resourcesData);
      
      toast({
        title: "MCP Hub Initialized",
        description: `Ready with ${statsData.totalAssets} assets across ${categoriesData.length} categories`,
      });
    } catch (error) {
      toast({
        title: "MCP Hub Error",
        description: error instanceof Error ? error.message : "Failed to initialize",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const context = await apiService.getContextForPrompt(searchQuery, 5);
      setContextResult(context);
      
      toast({
        title: "Search Complete",
        description: "Retrieved relevant documentation context",
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

  const handleMCPContextDemo = async () => {
    setIsLoading(true);
    try {
      const mcpContext = await apiService.getMCPContext();
      setContextResult(mcpContext);
      
      toast({
        title: "MCP Context Retrieved",
        description: "Loaded Model Context Protocol documentation",
      });
    } catch (error) {
      toast({
        title: "MCP Context Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);
    if (category === "all") return;
    
    setIsLoading(true);
    try {
      const assets = await mcpHubService.getAssetsByCategory(category);
      
      toast({
        title: "Category Filtered",
        description: `Found ${assets.length} assets in ${category} category`,
      });
    } catch (error) {
      toast({
        title: "Filter Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const preloadAssets = async () => {
    setIsLoading(true);
    try {
      await mcpHubService.preloadCriticalAssets();
      
      toast({
        title: "Assets Preloaded",
        description: "Critical assets cached for faster access",
      });
    } catch (error) {
      toast({
        title: "Preload Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await mcpHubService.clearCache();
      
      toast({
        title: "Cache Cleared",
        description: "MCP Hub cache has been reset",
      });
    } catch (error) {
      toast({
        title: "Clear Cache Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-6 w-6 text-blue-500" />
            MCP Hub - Attached Assets Context Retrieval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Demonstrate the Model Context Protocol hub for intelligent retrieval of context 
            from attached assets, including comprehensive MCP documentation and platform analysis.
          </p>
        </CardContent>
      </Card>

      {/* Statistics Dashboard */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Asset Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{stats.totalAssets}</div>
                <div className="text-sm text-muted-foreground">Total Assets</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{Object.keys(stats.categories).length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                <div className="text-2xl font-bold text-purple-500">{stats.cacheSize}</div>
                <div className="text-sm text-muted-foreground">Cached Items</div>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{Object.keys(stats.types).length}</div>
                <div className="text-sm text-muted-foreground">File Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Context Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter search query (e.g., 'MCP tools implementation')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleMCPContextDemo} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                Get MCP Documentation Context
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={preloadAssets} disabled={isLoading} size="sm" variant="outline">
                  <Zap className="h-4 w-4 mr-1" />
                  Preload
                </Button>
                <Button onClick={clearCache} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleCategoryFilter("all")}
              >
                All ({stats?.totalAssets || 0})
              </Badge>
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category} ({stats?.categories[category] || 0})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MCP Resources */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              MCP Resources Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="font-medium">{resource.name}</div>
                  <div className="text-sm text-muted-foreground">{resource.description}</div>
                  <div className="text-xs text-blue-500 mt-1">{resource.uri}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {contextResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Retrieved Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <Textarea
                value={contextResult}
                readOnly
                className="min-h-[350px] font-mono text-sm"
                placeholder="Context will appear here..."
              />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Demo Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={() => {
                setSearchQuery("MCP architecture and implementation");
                setTimeout(handleSearch, 100);
              }}
              variant="outline"
              size="sm"
            >
              MCP Architecture
            </Button>
            <Button 
              onClick={() => {
                setSearchQuery("RAG 2.0 advanced techniques");
                setTimeout(handleSearch, 100);
              }}
              variant="outline"
              size="sm"
            >
              RAG 2.0 Techniques
            </Button>
            <Button 
              onClick={() => {
                setSearchQuery("Agent-to-agent communication protocols");
                setTimeout(handleSearch, 100);
              }}
              variant="outline"
              size="sm"
            >
              A2A Communication
            </Button>
            <Button 
              onClick={() => {
                setSearchQuery("Cursor IDE features and capabilities");
                setTimeout(handleSearch, 100);
              }}
              variant="outline"
              size="sm"
            >
              Platform Features
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPHubDemo;