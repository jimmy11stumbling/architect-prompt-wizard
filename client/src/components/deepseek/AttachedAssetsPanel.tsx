import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Image, 
  File, 
  Search, 
  RefreshCw, 
  Check,
  AlertCircle,
  Folder
} from "lucide-react";
import { attachedAssetsService, AttachedAsset } from "@/services/deepseek/attachedAssetsService";
import { useToast } from "@/hooks/use-toast";

interface AttachedAssetsPanelProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onAssetsSelected?: (assets: AttachedAsset[]) => void;
}

const AttachedAssetsPanel: React.FC<AttachedAssetsPanelProps> = ({
  isEnabled,
  onToggle,
  onAssetsSelected
}) => {
  const [assets, setAssets] = useState<AttachedAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AttachedAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [assetStats, setAssetStats] = useState<any>(null);
  const { toast } = useToast();

  // Load assets on component mount and when enabled
  useEffect(() => {
    if (isEnabled) {
      loadAssets();
    }
  }, [isEnabled]);

  // Filter assets based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter(asset =>
        asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.metadata?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredAssets(filtered);
    }
  }, [searchQuery, assets]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const loadedAssets = await attachedAssetsService.loadAvailableAssets();
      setAssets(loadedAssets);
      
      // Get stats
      const stats = attachedAssetsService.getAssetStats();
      setAssetStats(stats);
      
      toast({
        title: "Assets Loaded",
        description: `Found ${loadedAssets.length} attached assets`,
      });
    } catch (error) {
      toast({
        title: "Failed to Load Assets",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cursor: "bg-blue-500/20 text-blue-400",
      bolt: "bg-orange-500/20 text-orange-400", 
      replit: "bg-green-500/20 text-green-400",
      windsurf: "bg-purple-500/20 text-purple-400",
      lovable: "bg-pink-500/20 text-pink-400",
      mcp: "bg-cyan-500/20 text-cyan-400",
      rag: "bg-yellow-500/20 text-yellow-400",
      a2a: "bg-red-500/20 text-red-400",
      general: "bg-gray-500/20 text-gray-400"
    };
    return colors[category] || colors.general;
  };

  const toggleAssetSelection = (filename: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedAssets(newSelected);
    
    // Notify parent of selection changes
    const selectedAssetObjects = assets.filter(asset => newSelected.has(asset.filename));
    onAssetsSelected?.(selectedAssetObjects);
  };

  const selectRelevantAssets = async () => {
    // Auto-select assets based on common categories
    const relevantCategories = ['cursor', 'bolt', 'replit', 'windsurf', 'lovable', 'mcp', 'rag', 'a2a'];
    const relevant = assets.filter(asset => 
      relevantCategories.includes(asset.metadata?.category || '')
    );
    
    const newSelected = new Set(relevant.map(asset => asset.filename));
    setSelectedAssets(newSelected);
    onAssetsSelected?.(relevant);
    
    toast({
      title: "Smart Selection",
      description: `Selected ${relevant.length} relevant assets`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Attached Assets
            {assetStats && (
              <Badge variant="outline">
                {assetStats.total} files
              </Badge>
            )}
          </CardTitle>
          <Switch checked={isEnabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>
      
      {isEnabled && (
        <CardContent className="space-y-4">
          {/* Search and Controls */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={loadAssets} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              onClick={selectRelevantAssets}
              size="sm"
              variant="outline"
            >
              Smart Select
            </Button>
          </div>

          {/* Asset Statistics */}
          {assetStats && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-blue-500/10 rounded">
                <div className="font-semibold">{assetStats.byType.text || 0}</div>
                <div className="text-muted-foreground">Text Files</div>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded">
                <div className="font-semibold">{assetStats.byType.document || 0}</div>
                <div className="text-muted-foreground">Documents</div>
              </div>
              <div className="text-center p-2 bg-purple-500/10 rounded">
                <div className="font-semibold">{assetStats.byType.image || 0}</div>
                <div className="text-muted-foreground">Images</div>
              </div>
            </div>
          )}

          {/* Selected Assets Summary */}
          {selectedAssets.size > 0 && (
            <div className="p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span className="font-medium">
                  {selectedAssets.size} assets selected for DeepSeek context
                </span>
              </div>
            </div>
          )}

          {/* Assets List */}
          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading assets...</span>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <AlertCircle className="h-6 w-6 mr-2" />
                <span>No assets found</span>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.filename}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedAssets.has(asset.filename)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleAssetSelection(asset.filename)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getAssetIcon(asset.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {asset.filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(asset.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {asset.metadata?.category && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryColor(asset.metadata.category)}`}
                          >
                            {asset.metadata.category}
                          </Badge>
                        )}
                        {selectedAssets.has(asset.filename) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                    
                    {asset.metadata?.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {asset.metadata.description}
                      </p>
                    )}
                    
                    {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {asset.metadata.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};

export default AttachedAssetsPanel;