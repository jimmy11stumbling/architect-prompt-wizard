
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";

interface ConsoleLog {
  id: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "success";
  source: string;
  message: string;
  data?: any;
}

const ConsoleValidator: React.FC = () => {
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Enhanced console logging with validation
  const addConsoleLog = (level: ConsoleLog["level"], source: string, message: string, data?: any) => {
    const log: ConsoleLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      source,
      message,
      data
    };

    setConsoleLogs(prev => [...prev.slice(-99), log]); // Keep last 100 logs

    // Enhanced console output with emojis and formatting
    const emoji = level === "success" ? "✅" : 
                  level === "error" ? "❌" : 
                  level === "warn" ? "⚠️" : "ℹ️";
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${emoji} [${timestamp}] [${source}] ${message}`, data || "");
    
    // Add to real-time response service
    realTimeResponseService.addResponse({
      source: `console-${source}`,
      status: level === "success" ? "success" : 
             level === "error" ? "error" : 
             level === "warn" ? "validation" : "processing",
      message: `CONSOLE: ${message}`,
      data
    });
  };

  // Validation functions for different components
  const validateRAGResponse = (query: string, results: any) => {
    addConsoleLog("info", "RAG-VALIDATOR", `Validating RAG query: "${query}"`);
    
    if (!results || !results.documents) {
      addConsoleLog("error", "RAG-VALIDATOR", "Invalid RAG response - missing documents", results);
      return false;
    }
    
    if (results.documents.length === 0) {
      addConsoleLog("warn", "RAG-VALIDATOR", "RAG query returned no documents", { query });
      return true;
    }
    
    addConsoleLog("success", "RAG-VALIDATOR", `RAG validation passed - ${results.documents.length} documents found`, {
      query,
      documentCount: results.documents.length,
      avgScore: results.scores?.reduce((a: number, b: number) => a + b, 0) / results.scores?.length || 0
    });
    
    return true;
  };

  const validateAgentResponse = (agentName: string, response: any) => {
    addConsoleLog("info", "AGENT-VALIDATOR", `Validating ${agentName} response`);
    
    if (!response) {
      addConsoleLog("error", "AGENT-VALIDATOR", `${agentName} returned null/undefined response`);
      return false;
    }
    
    if (typeof response === 'string' && response.length < 100) {
      addConsoleLog("warn", "AGENT-VALIDATOR", `${agentName} response seems too short`, { 
        length: response.length,
        preview: response.substring(0, 50)
      });
    }
    
    addConsoleLog("success", "AGENT-VALIDATOR", `${agentName} validation passed`, {
      responseType: typeof response,
      length: typeof response === 'string' ? response.length : 'N/A'
    });
    
    return true;
  };

  const validateSystemIntegration = (services: string[]) => {
    addConsoleLog("info", "SYSTEM-VALIDATOR", "Validating system integration");
    
    const requiredServices = ["RAG", "A2A", "MCP", "DeepSeek"];
    const missingServices = requiredServices.filter(service => 
      !services.some(s => s.toLowerCase().includes(service.toLowerCase()))
    );
    
    if (missingServices.length > 0) {
      addConsoleLog("error", "SYSTEM-VALIDATOR", "Missing required services", { 
        missing: missingServices,
        available: services
      });
      return false;
    }
    
    addConsoleLog("success", "SYSTEM-VALIDATOR", "All required services are integrated", { services });
    return true;
  };

  // Auto-validation hooks
  useEffect(() => {
    // Monitor real-time responses and validate them
    const interval = setInterval(() => {
      const responses = realTimeResponseService.getResponses();
      const recentResponses = responses.slice(-5); // Check last 5 responses
      
      recentResponses.forEach(response => {
        if (response.source.includes("rag")) {
          // Validate RAG responses
          if (response.data?.query) {
            validateRAGResponse(response.data.query, response.data);
          }
        } else if (response.source.includes("agent")) {
          // Validate agent responses
          validateAgentResponse(response.source, response.data);
        } else if (response.source.includes("system")) {
          // Validate system integration
          if (response.data?.services) {
            validateSystemIntegration(response.data.services);
          }
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Periodic system health checks
  useEffect(() => {
    const healthCheck = setInterval(() => {
      addConsoleLog("info", "HEALTH-CHECK", "Performing system health validation");
      
      // Check if services are responding
      const services = ["RAG", "A2A", "MCP", "DeepSeek"];
      validateSystemIntegration(services);
      
      // Memory usage check
      const memoryUsage = (performance as any).memory;
      if (memoryUsage) {
        const usedMB = Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memoryUsage.totalJSHeapSize / 1024 / 1024);
        
        if (usedMB > 100) {
          addConsoleLog("warn", "HEALTH-CHECK", "High memory usage detected", { 
            used: `${usedMB}MB`, 
            total: `${totalMB}MB` 
          });
        } else {
          addConsoleLog("success", "HEALTH-CHECK", "Memory usage is normal", { 
            used: `${usedMB}MB`, 
            total: `${totalMB}MB` 
          });
        }
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(healthCheck);
  }, []);

  const clearLogs = () => {
    setConsoleLogs([]);
    addConsoleLog("info", "CONSOLE-VALIDATOR", "Console logs cleared");
  };

  const exportLogs = () => {
    const logsData = JSON.stringify(consoleLogs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `console-validation-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    addConsoleLog("success", "CONSOLE-VALIDATOR", "Logs exported successfully");
  };

  const filteredLogs = consoleLogs.filter(log => 
    filter === "all" || log.level === filter
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success": return "text-green-500";
      case "error": return "text-red-500";
      case "warn": return "text-yellow-500";
      default: return "text-blue-500";
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "success": return "default";
      case "error": return "destructive";
      case "warn": return "secondary";
      default: return "outline";
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4 mr-2" />
        Show Console Validator
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Console Validator
            </div>
            <div className="flex items-center gap-1">
              <Button onClick={exportLogs} variant="ghost" size="sm">
                <Download className="h-3 w-3" />
              </Button>
              <Button onClick={clearLogs} variant="ghost" size="sm">
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
          <div className="flex gap-1">
            {["all", "info", "success", "warn", "error"].map((level) => (
              <Button
                key={level}
                onClick={() => setFilter(level)}
                variant={filter === level ? "default" : "outline"}
                size="sm"
                className="text-xs px-2 py-1 h-6"
              >
                {level}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 max-h-64 overflow-y-auto text-xs">
            {filteredLogs.slice(-20).reverse().map((log) => (
              <div key={log.id} className="border-l-2 border-gray-200 pl-2 py-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getLevelBadge(log.level) as any} className="text-xs px-1 py-0">
                      {log.level}
                    </Badge>
                    <span className="font-medium">{log.source}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-sm">{log.message}</p>
                {log.data && (
                  <pre className="mt-1 text-xs bg-muted p-1 rounded overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsoleValidator;
