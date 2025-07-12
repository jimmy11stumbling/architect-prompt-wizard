
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Brain, Network, Database, Zap } from "lucide-react";
import { attachedAssetsMCPHub } from "@/services/mcp/attachedAssetsMcpHub";

interface DeepDiveAsset {
  title: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  keyTopics: string[];
  filename: string;
  color: string;
}

const DEEP_DIVE_ASSETS: DeepDiveAsset[] = [
  {
    title: "A2A Communication Deep Dive",
    category: "agent-communication",
    icon: <Network className="h-6 w-6" />,
    description: "Comprehensive analysis of Agent-to-Agent communication protocols, multi-agent systems, FIPA ACL, KQML, and Google's A2A standard.",
    keyTopics: ["Multi-Agent Systems", "FIPA ACL", "KQML", "Google A2A", "Agent Coordination", "Communication Protocols"],
    filename: "A2A Agent Communication Deep Dive__1751005451948.txt",
    color: "border-purple-200 bg-purple-50"
  },
  {
    title: "Model Context Protocol (MCP)",
    category: "integration",
    icon: <Zap className="h-6 w-6" />,
    description: "Complete MCP specification analysis covering architecture, security, implementations, and ecosystem adoption by major AI labs.",
    keyTopics: ["MCP Protocol", "Anthropic Standard", "Tool Integration", "Security Analysis", "SDK Implementation", "Enterprise Adoption"],
    filename: "MCP Deep Dive Research__1751005451947.txt",
    color: "border-blue-200 bg-blue-50"
  },
  {
    title: "RAG 2.0 Advanced Techniques",
    category: "retrieval",
    icon: <Database className="h-6 w-6" />,
    description: "Advanced retrieval-augmented generation covering hybrid search, reranking, evaluation frameworks, and production implementations.",
    keyTopics: ["RAG 2.0", "Hybrid Search", "Vector Databases", "Reranking", "Evaluation", "GraphRAG", "Contextual AI"],
    filename: "RAG 2.0 Deep Dive Report__1751005451945.txt",
    color: "border-green-200 bg-green-50"
  }
];

export default function DeepDiveAssetsExplorer() {
  const [selectedAsset, setSelectedAsset] = useState<DeepDiveAsset | null>(null);
  const [assetContent, setAssetContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  const loadAssetContent = async (asset: DeepDiveAsset) => {
    setIsLoading(true);
    try {
      const content = await attachedAssetsMCPHub.getAssetContent(asset.filename);
      setAssetContent(content);
      setSelectedAsset(asset);
    } catch (error) {
      console.error('Failed to load asset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchInAssets = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await attachedAssetsMCPHub.queryAssets({
        query,
        maxAssets: 3,
        includeContent: true,
        relevanceThreshold: 0.1
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContentPreview = (content: string, maxLength = 500) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            Deep Dive Knowledge Assets Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Explore comprehensive technical deep dives on A2A communication, MCP protocol, and RAG 2.0 techniques.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {DEEP_DIVE_ASSETS.map((asset, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all hover:shadow-md ${asset.color} ${
                  selectedAsset?.filename === asset.filename ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => loadAssetContent(asset)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {asset.icon}
                    {asset.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    {asset.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {asset.keyTopics.slice(0, 3).map((topic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {asset.keyTopics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{asset.keyTopics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => searchInAssets("MCP protocol implementation")}
              variant="outline"
              size="sm"
            >
              Search: MCP Implementation
            </Button>
            <Button
              onClick={() => searchInAssets("RAG hybrid search techniques")}
              variant="outline"
              size="sm"
            >
              Search: RAG Techniques
            </Button>
            <Button
              onClick={() => searchInAssets("agent communication protocols")}
              variant="outline"
              size="sm"
            >
              Search: Agent Protocols
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading content...</p>
          </CardContent>
        </Card>
      )}

      {selectedAsset && assetContent && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedAsset.icon}
              {selectedAsset.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Full Content</TabsTrigger>
                <TabsTrigger value="topics">Key Topics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Document Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAsset.description}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Content Preview</h4>
                  <div className="bg-background border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {getContentPreview(assetContent, 1000)}
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                <div className="bg-background border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {assetContent}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="topics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedAsset.keyTopics.map((topic, idx) => (
                    <Badge key={idx} variant="secondary" className="justify-center">
                      {topic}
                    </Badge>
                  ))}
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Usage in Context</h4>
                  <p className="text-sm text-muted-foreground">
                    This asset is automatically available to the MCP Hub and will be used as context 
                    when generating project specifications that involve {selectedAsset.category} topics.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {searchResults && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.relevantAssets.map((asset: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{asset.filename}</h4>
                    <Badge variant="outline">
                      Score: {(asset.metadata?.relevanceScore || 0).toFixed(2)}
                    </Badge>
                  </div>
                  {searchResults.contextData[asset.filename] && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {getContentPreview(searchResults.contextData[asset.filename], 300)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
