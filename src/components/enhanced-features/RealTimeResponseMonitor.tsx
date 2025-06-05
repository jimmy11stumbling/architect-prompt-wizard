
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, CheckCircle, XCircle, AlertTriangle, Trash2, Eye, EyeOff } from "lucide-react";
import { realTimeResponseService, RealTimeResponse } from "@/services/integration/realTimeResponseService";

const RealTimeResponseMonitor: React.FC = () => {
  const [responses, setResponses] = useState<RealTimeResponse[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!isMonitoring) return;

    const unsubscribe = realTimeResponseService.subscribe((response) => {
      setResponses(prev => [response, ...prev.slice(0, 99)]);
    });

    // Load existing responses
    setResponses(realTimeResponseService.getRecentResponses());

    return unsubscribe;
  }, [isMonitoring]);

  const getStatusIcon = (status: string, validationResult?: any) => {
    if (validationResult && !validationResult.isValid) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }

    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "validation":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, validationResult?: any) => {
    if (validationResult && !validationResult.isValid) {
      return "bg-red-100 text-red-800";
    }

    switch (status) {
      case "success": return "bg-green-100 text-green-800";
      case "error": return "bg-red-100 text-red-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "validation": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const clearResponses = () => {
    realTimeResponseService.clearResponses();
    setResponses([]);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const filteredResponses = responses.filter(response => {
    if (filter === "all") return true;
    if (filter === "errors") return response.status === "error" || (response.validationResult && !response.validationResult.isValid);
    if (filter === "success") return response.status === "success" && (!response.validationResult || response.validationResult.isValid);
    if (filter === "processing") return response.status === "processing";
    return response.source === filter;
  });

  const errorCount = responses.filter(r => r.status === "error" || (r.validationResult && !r.validationResult.isValid)).length;
  const successCount = responses.filter(r => r.status === "success" && (!r.validationResult || r.validationResult.isValid)).length;
  const processingCount = responses.filter(r => r.status === "processing").length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Response Monitor
            {isMonitoring && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleMonitoring}>
              {isMonitoring ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isMonitoring ? "Stop" : "Start"}
            </Button>
            <Button variant="outline" size="sm" onClick={clearResponses}>
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <Badge variant="outline" className="bg-green-50">
            ✓ Success: {successCount}
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            ✗ Errors: {errorCount}
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            ⏳ Processing: {processingCount}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            📊 Total: {responses.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="rag-service">RAG</TabsTrigger>
            <TabsTrigger value="deepseek-reasoner">DeepSeek</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredResponses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No responses to display
                  </div>
                ) : (
                  filteredResponses.map((response) => (
                    <div key={response.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(response.status, response.validationResult)}
                          <span className="font-medium text-sm">{response.source}</span>
                          <Badge className={getStatusColor(response.status, response.validationResult)}>
                            {response.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        {response.message}
                      </div>

                      {response.validationResult && (
                        <div className="text-xs space-y-1">
                          {response.validationResult.errors.length > 0 && (
                            <div className="text-red-600">
                              🚨 Errors: {response.validationResult.errors.join(", ")}
                            </div>
                          )}
                          {response.validationResult.warnings.length > 0 && (
                            <div className="text-yellow-600">
                              ⚠️ Warnings: {response.validationResult.warnings.join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      {response.data && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            View Data
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(response.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RealTimeResponseMonitor;
