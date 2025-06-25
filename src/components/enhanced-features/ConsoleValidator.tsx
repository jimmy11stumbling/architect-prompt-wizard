
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react";
import { realTimeResponseService, RealTimeResponse } from "@/services/integration/realTimeResponseService";

const ConsoleValidator: React.FC = () => {
  const [consoleOutputs, setConsoleOutputs] = useState<RealTimeResponse[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const unsubscribe = realTimeResponseService.subscribe((response) => {
      setConsoleOutputs(prev => [response, ...prev.slice(0, 49)]);
      
      // Auto-validate responses
      if (response.status === "success" || response.status === "error") {
        setValidationResults(prev => ({
          ...prev,
          [response.id]: response.status === "success"
        }));
      }
    });

    // Load existing responses
    const existing = realTimeResponseService.getResponses(50);
    setConsoleOutputs(existing);

    return unsubscribe;
  }, []);

  const runValidationCheck = () => {
    setIsRunning(true);
    
    realTimeResponseService.addResponse({
      source: "console-validator",
      status: "processing", // Changed from "validation" to "processing"
      message: "Running comprehensive validation check...",
      data: { timestamp: Date.now() }
    });

    setTimeout(() => {
      const successCount = consoleOutputs.filter(output => output.status === "success").length;
      const errorCount = consoleOutputs.filter(output => output.status === "error").length;
      const totalResponses = consoleOutputs.length;
      
      realTimeResponseService.addResponse({
        source: "console-validator",
        status: successCount > errorCount ? "success" : "warning",
        message: `Validation complete: ${successCount}/${totalResponses} operations successful`,
        data: { 
          successCount, 
          errorCount, 
          totalResponses,
          successRate: totalResponses > 0 ? (successCount / totalResponses * 100).toFixed(1) : "0"
        }
      });
      
      setIsRunning(false);
    }, 2000);
  };

  const clearConsole = () => {
    realTimeResponseService.clearResponses();
    setConsoleOutputs([]);
    setValidationResults({});
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "processing":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Live Console & Validation Monitor
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={runValidationCheck} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? "Running..." : "Run Validation"}
          </Button>
          <Button onClick={clearConsole} variant="outline" size="sm">
            Clear Console
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {consoleOutputs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No console output yet. System operations will appear here.
            </div>
          ) : (
            consoleOutputs.map((output) => (
              <div 
                key={output.id} 
                className="flex items-start gap-3 p-3 border rounded-lg text-sm"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(output.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {output.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(output.timestamp).toLocaleTimeString()}
                    </span>
                    {validationResults[output.id] !== undefined && (
                      <Badge 
                        variant={validationResults[output.id] ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {validationResults[output.id] ? "✓ Valid" : "✗ Invalid"}
                      </Badge>
                    )}
                  </div>
                  <div className={`font-medium ${getStatusColor(output.status)}`}>
                    {output.message}
                  </div>
                  {output.data && Object.keys(output.data).length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(output.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsoleValidator;
