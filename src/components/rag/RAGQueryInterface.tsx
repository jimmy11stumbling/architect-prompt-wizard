import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Database, FileText, Zap, CheckCircle } from "lucide-react";
import { ragService, RAGQuery, RAGResponse } from "@/services/rag/ragService";
import { a2aService } from "@/services/a2a/a2aService";

const RAGQueryInterface: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RAGResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [realTimeLog, setRealTimeLog] = useState<string[]>([]);

  useEffect(() => {
    if (!ragService.isInitialized()) {
      ragService.initialize();
    }
  }, []);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setRealTimeLog(prev => [...prev.slice(-9), logEntry]);
    console.log("RAG:", logEntry);
  };

  const executeRAGQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setProgress(0);
    setResults(null);
    
    try {
      addToLog("🔍 Starting RAG query execution");
      setProgress(20);

      // Step 1: A2A coordination
      addToLog("📡 Coordinating with A2A agents");
      const delegation = await a2aService.delegateTask(
        `RAG query: ${query}`,
        ["document-retrieval", "semantic-search"]
      );
      
      if (delegation.assignedAgent) {
        addToLog(`✅ Task assigned to: ${delegation.assignedAgent.name}`);
      }
      setProgress(40);

      // Step 2: Execute RAG query
      addToLog("🔎 Executing semantic search");
      const ragQuery: RAGQuery = {
        query,
        limit: 5,
        threshold: 0.3
      };

      const ragResults = await ragService.query(ragQuery);
      setProgress(60);

      addToLog(`📊 Found ${ragResults.documents.length} relevant documents`);
      addToLog(`🎯 Query: "${ragResults.query}"`);

      // Step 3: Process results
      addToLog("⚡ Processing and ranking results");
      setProgress(80);

      // Send A2A message about completion
      await a2aService.sendMessage({
        id: `rag-complete-${Date.now()}`,
        from: "rag-interface",
        to: "workflow-orchestrator",
        type: "notification",
        payload: {
          query,
          resultsCount: ragResults.documents.length,
          avgScore: ragResults.scores.reduce((a, b) => a + b, 0) / ragResults.scores.length
        },
        timestamp: Date.now()
      });

      setResults(ragResults);
      setProgress(100);
      addToLog("✨ RAG query completed successfully");

    } catch (error) {
      console.error("RAG query failed:", error);
      addToLog(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setQuery("");
    setResults(null);
    setRealTimeLog([]);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG 2.0 Knowledge Retrieval System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your knowledge query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && executeRAGQuery()}
              className="flex-1"
            />
            <Button 
              onClick={executeRAGQuery}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Query RAG
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing query...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {realTimeLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Real-time Processing Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                  {realTimeLog.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {results && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">Search Results</TabsTrigger>
            <TabsTrigger value="metadata">Query Metadata</TabsTrigger>
            <TabsTrigger value="integration">A2A Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <div className="space-y-4">
              {results.documents.map((doc, index) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {doc.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Score: {(results.scores[index] * 100).toFixed(1)}%
                        </Badge>
                        <Badge variant="secondary">
                          {doc.metadata.source}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metadata">
            <Card>
              <CardHeader>
                <CardTitle>Query Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{results.documents.length}</div>
                    <div className="text-sm text-muted-foreground">Documents Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{results.totalResults}</div>
                    <div className="text-sm text-muted-foreground">Total Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {((results.scores.reduce((a, b) => a + b, 0) / results.scores.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Relevance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.max(...results.scores).toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">Best Match</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>A2A Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>A2A agents coordinated successfully</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Task delegation completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time notifications sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Results integrated with A2A workflow</span>
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
