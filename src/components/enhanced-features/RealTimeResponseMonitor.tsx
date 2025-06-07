
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Trash2,
  RefreshCw,
  Filter
} from "lucide-react";
import { realTimeResponseService, RealTimeResponse } from "@/services/integration/realTimeResponseService";

const RealTimeResponseMonitor: React.FC = () => {
  const [responses, setResponses] = useState<RealTimeResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<RealTimeResponse[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Load initial responses
    const initialResponses = realTimeResponseService.getRecentResponses(100);
    setResponses(initialResponses);
    setFilteredResponses(initialResponses);

    // Subscribe to new responses
    const unsubscribe = realTimeResponseService.subscribe((response: RealTimeResponse) => {
      if (isLive) {
        setResponses(prev => [response, ...prev].slice(0, 100));
      }
    });

    return unsubscribe;
  }, [isLive]);

  useEffect(() => {
    // Apply filters
    let filtered = responses;
    
    switch (activeFilter) {
      case "success":
        filtered = responses.filter(r => r.status === "success");
        break;
      case "error":
        filtered = responses.filter(r => r.status === "error");
        break;
      case "processing":
        filtered = responses.filter(r => r.status === "processing");
        break;
      case "validation":
        filtered = responses.filter(r => r.status === "validation");
        break;
      case "failed-validation":
        filtered = responses.filter(r => r.validationResult && !r.validationResult.isValid);
        break;
      default:
        filtered = responses;
    }
    
    setFilteredResponses(filtered);
  }, [responses, activeFilter]);

  const getStatusIcon = (status: RealTimeResponse["status"]) => {
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
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getValidationBadge = (response: RealTimeResponse) => {
    if (!response.validationResult) return null;
    
    const { isValid, errors, warnings } = response.validationResult;
    
    if (!isValid) {
      return <Badge variant="destructive" className="text-xs">Failed ({errors.length} errors)</Badge>;
    }
    
    if (warnings.length > 0) {
      return <Badge variant="secondary" className="text-xs">Warning ({warnings.length})</Badge>;
    }
    
    return <Badge variant="default" className="text-xs bg-green-500">Valid</Badge>;
  };

  const clearResponses = () => {
    realTimeResponseService.clearResponses();
    setResponses([]);
    setFilteredResponses([]);
  };

  const refreshResponses = () => {
    const freshResponses = realTimeResponseService.getRecentResponses(100);
    setResponses(freshResponses);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusCounts = () => {
    return {
      total: responses.length,
      success: responses.filter(r => r.status === "success").length,
      error: responses.filter(r => r.status === "error").length,
      processing: responses.filter(r => r.status === "processing").length,
      validation: responses.filter(r => r.status === "validation").length,
      failedValidation: responses.filter(r => r.validationResult && !r.validationResult.isValid).length
    };
  };

  const counts = getStatusCounts();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${isLive ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
            Real-Time Response Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isLive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? "Live" : "Paused"}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshResponses}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clearResponses}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-2 text-sm">
          <Badge variant="outline">Total: {counts.total}</Badge>
          <Badge variant="outline" className="text-green-600">Success: {counts.success}</Badge>
          <Badge variant="outline" className="text-red-600">Error: {counts.error}</Badge>
          <Badge variant="outline" className="text-blue-600">Processing: {counts.processing}</Badge>
          <Badge variant="outline" className="text-yellow-600">Validation: {counts.validation}</Badge>
          <Badge variant="outline" className="text-purple-600">Failed: {counts.failedValidation}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="failed-validation">Failed</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {filteredResponses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No responses found for the selected filter
              </div>
            ) : (
              filteredResponses.map((response) => (
                <Card key={response.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(response.status)}
                      <Badge variant="outline" className="text-xs">
                        {response.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(response.timestamp)}
                      </span>
                      {getValidationBadge(response)}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium">{response.message}</p>
                    
                    {response.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          View Data ({Object.keys(response.data).length} fields)
                        </summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </details>
                    )}
                    
                    {response.validationResult && (
                      <div className="mt-2 text-xs">
                        {response.validationResult.errors.length > 0 && (
                          <div className="text-red-600">
                            <strong>Errors:</strong>
                            <ul className="ml-4 list-disc">
                              {response.validationResult.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {response.validationResult.warnings.length > 0 && (
                          <div className="text-yellow-600">
                            <strong>Warnings:</strong>
                            <ul className="ml-4 list-disc">
                              {response.validationResult.warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealTimeResponseMonitor;
