
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Database, FileText, Zap } from "lucide-react";
import { ragService } from "@/services/rag/ragService";
import { RAGQuery, RAGResult } from "@/types/ipa-types";

const RAGQueryInterface: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RAGResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState([0.7]);
  const [limit, setLimit] = useState([5]);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("rag_query_history");
    if (saved) {
      setQueryHistory(JSON.parse(saved));
    }
  }, []);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const ragQuery: RAGQuery = {
        query: query.trim(),
        threshold: threshold[0],
        limit: limit[0]
      };

      const result = await ragService.query(ragQuery);
      setResults(result);

      const newHistory = [query, ...queryHistory.filter(h => h !== query)].slice(0, 10);
      setQueryHistory(newHistory);
      localStorage.setItem("rag_query_history", JSON.stringify(newHistory));
    } catch (error) {
      console.error("RAG query failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG Knowledge Query Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="query">Query</Label>
              <Textarea
                id="query"
                placeholder="Enter your query to search the knowledge base..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Similarity Threshold: {threshold[0]}</Label>
                <Slider
                  value={threshold}
                  onValueChange={setThreshold}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Result Limit: {limit[0]}</Label>
                <Slider
                  value={limit}
                  onValueChange={setLimit}
                  max={20}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <Button 
              onClick={handleQuery} 
              disabled={loading || !query.trim()}
              className="w-full"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search Knowledge Base
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Search Results</TabsTrigger>
          <TabsTrigger value="history">Query History</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          {results ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search Results</span>
                  <Badge variant="outline">
                    {results.documents.length} of {results.totalResults} results
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.documents.map((doc, index) => (
                    <div key={doc.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{doc.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Score: {results.scores[index]?.toFixed(3)}
                          </Badge>
                          <Badge variant="outline">{doc.source}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {doc.content}
                      </p>
                      {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(doc.metadata).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No search results yet. Enter a query to search the knowledge base.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {queryHistory.length > 0 ? (
                <div className="space-y-2">
                  {queryHistory.map((historyQuery, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setQuery(historyQuery)}
                    >
                      <span className="text-sm">{historyQuery}</span>
                      <Button variant="ghost" size="sm">
                        <Zap className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No query history yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RAGQueryInterface;
