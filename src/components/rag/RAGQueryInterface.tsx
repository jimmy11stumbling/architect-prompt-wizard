
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Search, FileText, Clock, Target } from "lucide-react";
import { ragService, RAGResponse } from "@/services/rag/ragService";
import { useToast } from "@/hooks/use-toast";

const RAGQueryInterface: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RAGResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [limit, setLimit] = useState(5);
  const [threshold, setThreshold] = useState(0.3);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await ragService.query({
        query: query.trim(),
        limit,
        threshold
      });
      setResults(response);
      
      toast({
        title: "Search Complete",
        description: `Found ${response.documents.length} relevant documents`
      });
    } catch (error) {
      console.error("RAG query failed:", error);
      toast({
        title: "Search Failed",
        description: "Unable to query the RAG database",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const sampleQueries = [
    "RAG 2.0 architecture and implementation",
    "Agent-to-Agent protocol communication",
    "Model Context Protocol integration",
    "DeepSeek reasoning capabilities",
    "Multi-agent system coordination"
  ];

  return (
    <div className="space-y-6">
      {/* Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG 2.0 Knowledge Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Search Query</Label>
            <Input
              id="query"
              placeholder="Enter your search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Result Limit</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="20"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Similarity Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value) || 0.3)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !query.trim()}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Knowledge Base
              </>
            )}
          </Button>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Sample Queries:</Label>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(sample)}
                  className="text-xs"
                >
                  {sample}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Tabs defaultValue="documents" className="w-full">
          <TabsList>
            <TabsTrigger value="documents">Documents ({results.documents.length})</TabsTrigger>
            <TabsTrigger value="metrics">Search Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            {results.documents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium">No Documents Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your query or lowering the similarity threshold
                  </p>
                </CardContent>
              </Card>
            ) : (
              results.documents.map((doc, index) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.source}</Badge>
                        {results.scores && (
                          <Badge variant="secondary">
                            Score: {results.scores[index]?.toFixed(2) || "N/A"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {doc.content.length > 300 
                        ? `${doc.content.substring(0, 300)}...` 
                        : doc.content
                      }
                    </p>
                    {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <Label className="text-xs text-muted-foreground">Metadata:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(doc.metadata).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Search Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{results.searchTime || 0}ms</div>
                      <div className="text-sm text-muted-foreground">Search Time</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{results.totalResults}</div>
                      <div className="text-sm text-muted-foreground">Total Results</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Database className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">
                        {results.scores?.length ? 
                          (results.scores.reduce((a, b) => a + b, 0) / results.scores.length).toFixed(2) 
                          : "0"
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Query Details</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Query:</strong> {results.query}</div>
                    <div><strong>Limit:</strong> {limit}</div>
                    <div><strong>Threshold:</strong> {threshold}</div>
                    <div><strong>Vector Database:</strong> Chroma</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RAGQueryInterface;
