
import React, { useState } from "react";
import { SavedPrompt } from "@/services/api/promptService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Trash2, 
  Edit, 
  Copy, 
  Download, 
  Eye, 
  Star, 
  Globe, 
  Lock,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptManagementProps {
  prompts: SavedPrompt[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading: boolean;
  onDelete: (id: number) => void;
  onCopy: (prompt: string) => void;
  onDownload: (prompt: string, filename?: string) => void;
  onEdit: (prompt: SavedPrompt) => void;
}

const PromptManagement: React.FC<PromptManagementProps> = ({
  prompts,
  searchTerm,
  onSearchChange,
  isLoading,
  onDelete,
  onCopy,
  onDownload,
  onEdit
}) => {
  const [selectedPrompts, setSelectedPrompts] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'usage' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'public' | 'private'>('all');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPrompts(prompts.map(p => p.id));
    } else {
      setSelectedPrompts([]);
    }
  };

  const handleSelectPrompt = (promptId: number, checked: boolean) => {
    if (checked) {
      setSelectedPrompts([...selectedPrompts, promptId]);
    } else {
      setSelectedPrompts(selectedPrompts.filter(id => id !== promptId));
    }
  };

  const handleBulkDelete = () => {
    selectedPrompts.forEach(id => onDelete(id));
    setSelectedPrompts([]);
  };

  const sortedAndFilteredPrompts = prompts
    .filter(prompt => {
      const matchesSearch = prompt.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'public' && prompt.isPublic) ||
                           (filterBy === 'private' && !prompt.isPublic);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.projectName.localeCompare(b.projectName);
          break;
        case 'usage':
          comparison = (a.usage || 0) - (b.usage || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'date':
        default:
          comparison = (a.lastModified || a.timestamp) - (b.lastModified || b.timestamp);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Management Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Prompt Management
          </CardTitle>
          <CardDescription>
            Organize, edit, and manage your saved prompts. Select multiple prompts for bulk actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts by name, content, or tags..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prompts</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPrompts.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedPrompts.length} prompt{selectedPrompts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPrompts([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prompts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedPrompts.length === prompts.length && prompts.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select All ({sortedAndFilteredPrompts.length} prompts)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {sortedAndFilteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedPrompts.includes(prompt.id)}
                          onCheckedChange={(checked) => handleSelectPrompt(prompt.id, checked as boolean)}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold line-clamp-1">{prompt.projectName}</h3>
                            <div className="flex items-center gap-1">
                              {prompt.isPublic ? (
                                <Badge variant="secondary" className="text-xs">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                              {prompt.rating && prompt.rating > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                  {prompt.rating}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {prompt.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                              {prompt.description}
                            </p>
                          )}

                          <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {prompt.prompt.substring(0, 200)}...
                          </div>

                          {prompt.tags && prompt.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {prompt.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {prompt.tags.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{prompt.tags.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Modified: {new Date(prompt.lastModified || prompt.timestamp).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-4">
                              {prompt.usage && prompt.usage > 0 && (
                                <span>{prompt.usage} uses</span>
                              )}
                              <span>ID: {prompt.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(prompt)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCopy(prompt.prompt)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Prompt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownload(prompt.prompt, `${prompt.projectName}.md`)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(prompt.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {sortedAndFilteredPrompts.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No prompts found matching your criteria</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptManagement;
