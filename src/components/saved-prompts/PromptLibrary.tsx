
import React, { useState, useEffect } from "react";
import { SavedPrompt, PromptCategory, PromptStats, supabasePromptService } from "@/services/db/supabasePromptService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Search, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Upload,
  Filter,
  Grid,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptLibraryProps {
  prompts: SavedPrompt[];
  onPromptSelect?: (prompt: SavedPrompt) => void;
  onPromptUse?: (prompt: SavedPrompt) => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ 
  prompts, 
  onPromptSelect, 
  onPromptUse 
}) => {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [featuredPrompts, setFeaturedPrompts] = useState<SavedPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, statsData, featuredData] = await Promise.all([
        supabasePromptService.getCategories(),
        supabasePromptService.getStats(),
        supabasePromptService.getFeaturedPrompts()
      ]);
      
      setCategories(categoriesData);
      setStats(statsData);
      setFeaturedPrompts(featuredData);
    } catch (error) {
      console.error("Failed to load library data:", error);
      toast({
        title: "Error",
        description: "Failed to load prompt library data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchTerm || 
      prompt.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleExport = async () => {
    try {
      const exportData = await supabasePromptService.exportPrompts();
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-library-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your prompt library has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export prompt library",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedCount = await supabasePromptService.importPrompts(text);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${importedCount} prompts`,
      });
      
      await loadLibraryData();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import prompt library",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
          <p className="text-muted-foreground">Loading prompt library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Library Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Prompts</p>
                  <p className="text-2xl font-bold">{stats.totalPrompts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Public Prompts</p>
                  <p className="text-2xl font-bold">{stats.publicPrompts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Total Usage</p>
                  <p className="text-2xl font-bold">{stats.totalUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts by name, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <label>
              <Upload className="h-4 w-4 mr-1" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Prompts</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="public">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon} {category.name} ({category.count})
              </Button>
            ))}
          </div>

          {/* Prompts Grid/List */}
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : 
            "space-y-4"
          }>
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{prompt.projectName}</CardTitle>
                    {prompt.isPublic && <Badge variant="secondary">Public</Badge>}
                  </div>
                  {prompt.description && (
                    <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {prompt.prompt.substring(0, 150)}...
                    </div>
                    
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {prompt.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{prompt.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(prompt.timestamp).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        {prompt.rating && prompt.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{prompt.rating}</span>
                          </div>
                        )}
                        {prompt.usage && prompt.usage > 0 && (
                          <span>{prompt.usage} uses</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => onPromptSelect?.(prompt)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onPromptUse?.(prompt)}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredPrompts.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No prompts found matching your criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPrompts.map((prompt) => (
              <Card key={prompt.id} className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <CardTitle className="text-lg">{prompt.projectName}</CardTitle>
                  </div>
                  {prompt.description && (
                    <CardDescription>{prompt.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {prompt.prompt.substring(0, 150)}...
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Rating: {prompt.rating}/5</span>
                      <span>{prompt.usage} uses</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onPromptUse?.(prompt)}
                    >
                      Use This Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    {category.name}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {category.count} prompts
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="text-center py-4">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Community Prompts</h3>
            <p className="text-muted-foreground">
              Discover and share prompts with the community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.filter(p => p.isPublic).map((prompt) => (
              <Card key={prompt.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{prompt.projectName}</CardTitle>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  </div>
                  {prompt.author && (
                    <CardDescription>by {prompt.author}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {prompt.prompt.substring(0, 150)}...
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Rating: {prompt.rating || 0}/5</span>
                      <span>{prompt.usage || 0} uses</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => onPromptUse?.(prompt)}
                    >
                      Use This Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromptLibrary;
