import React from "react";
import { SavedPrompt } from "@/services/api/promptService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Search, Star, Users, Globe } from "lucide-react";
import { usePromptLibrary } from "./hooks/usePromptLibrary";
import LibraryStats from "./components/LibraryStats";
import LibraryControls from "./components/LibraryControls";

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
  const {
    categories,
    stats,
    featuredPrompts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    isLoading,
    filteredPrompts,
    handleExport,
    handleImport
  } = usePromptLibrary(prompts);

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
      {stats && <LibraryStats stats={stats} totalPrompts={prompts.length} />}

      {/* Search and Controls */}
      <LibraryControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
      />

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
                        {prompt.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
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
                      <Globe className="h-3 w-3 mr-1" />
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