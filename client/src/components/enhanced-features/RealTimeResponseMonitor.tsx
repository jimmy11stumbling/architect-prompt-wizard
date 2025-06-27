
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Activity, Trash2, Download, Filter } from "lucide-react";
import { realTimeResponseService, RealTimeResponse } from "@/services/integration/realTimeResponseService";
import { useToast } from "@/hooks/use-toast";

const RealTimeResponseMonitor: React.FC = () => {
  const [responses, setResponses] = useState<RealTimeResponse[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const { toast } = useToast();

  const fetchResponses = () => {
    const allResponses = realTimeResponseService.getResponses();
    setResponses([...allResponses].reverse()); // Show newest first
  };

  const clearResponses = () => {
    realTimeResponseService.clearResponses();
    setResponses([]);
    toast({
      title: "Monitor Cleared",
      description: "All real-time responses have been cleared"
    });
  };

  const exportResponses = () => {
    const dataStr = JSON.stringify(responses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ipa-system-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "System logs have been downloaded"
    });
  };

  const filteredResponses = responses.filter(response => {
    if (filter === "all") return true;
    return response.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-500";
      case "error": return "text-red-500";
      case "processing": return "text-blue-500";
      case "validation": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "success": return "default";
      case "error": return "destructive";
      case "processing": return "secondary";
      case "validation": return "outline";
      default: return "outline";
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes("deepseek")) return "🧠";
    if (source.includes("rag")) return "📚";
    if (source.includes("a2a")) return "🤖";
    if (source.includes("mcp")) return "🔧";
    if (source.includes("system")) return "⚙️";
    return "📡";
  };

  useEffect(() => {
    fetchResponses();
    
    if (isAutoRefresh) {
      const interval = setInterval(fetchResponses, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh]);

  const responsesBySource = responses.reduce((acc, response) => {
    if (!acc[response.source]) {
      acc[response.source] = [];
    }
    acc[response.source].push(response);
    return acc;
  }, {} as Record<string, RealTimeResponse[]>);

  const statusCounts = responses.reduce((acc, response) => {
    acc[response.status] = (acc[response.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Monitor Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Real-time System Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              variant={isAutoRefresh ? "default" : "outline"}
              size="sm"
            >
              <Activity className={`h-4 w-4 ${isAutoRefresh ? "animate-pulse" : ""}`} />
              {isAutoRefresh ? "Live" : "Paused"}
            </Button>
            <Button onClick={exportResponses} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={clearResponses} variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{responses.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{statusCounts.success || 0}</div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{statusCounts.error || 0}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{statusCounts.processing || 0}</div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Events ({responses.length})</TabsTrigger>
          <TabsTrigger value="by-source">By Source</TabsTrigger>
          <TabsTrigger value="errors">Errors ({statusCounts.error || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filter:</span>
            {["all", "success", "error", "processing", "validation"].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Event Stream */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredResponses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium">No Events</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time system events will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredResponses.map((response) => (
                <Card key={response.id} className={`border-l-4 ${
                  response.status === "success" ? "border-l-green-500" :
                  response.status === "error" ? "border-l-red-500" :
                  response.status === "processing" ? "border-l-blue-500" :
                  "border-l-yellow-500"
                }`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{getSourceIcon(response.source)}</span>
                          <span className="font-medium text-sm">{response.source}</span>
                          <Badge variant={getStatusVariant(response.status)}>
                            {response.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-2">{response.message}</p>
                        
                        {response.data && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Show Details
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(response.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="by-source" className="space-y-4">
          {Object.entries(responsesBySource).map(([source, sourceResponses]) => (
            <Card key={source}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>{getSourceIcon(source)}</span>
                  {source}
                  <Badge variant="outline">{sourceResponses.length} events</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-500">
                      {sourceResponses.filter(r => r.status === "success").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">
                      {sourceResponses.filter(r => r.status === "error").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-500">
                      {sourceResponses.filter(r => r.status === "processing").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Processing</div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sourceResponses.slice(0, 5).map((response) => (
                    <div key={response.id} className="text-sm p-2 bg-muted rounded">
                      <div className="flex items-center justify-between">
                        <span>{response.message}</span>
                        <Badge variant={getStatusVariant(response.status)} className="text-xs">
                          {response.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(response.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {sourceResponses.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      ... and {sourceResponses.length - 5} more events
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {responses.filter(r => r.status === "error").length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-green-500 text-4xl mb-4">✅</div>
                <h3 className="font-medium">No Errors</h3>
                <p className="text-sm text-muted-foreground">
                  All systems are running smoothly
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {responses.filter(r => r.status === "error").map((response) => (
                <Card key={response.id} className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{getSourceIcon(response.source)}</span>
                          <span className="font-medium text-sm">{response.source}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-red-600 mb-2">{response.message}</p>
                        
                        {response.data && (
                          <div className="text-xs p-2 bg-red-50 rounded">
                            <pre className="text-red-800 overflow-x-auto">
                              {JSON.stringify(response.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeResponseMonitor;
