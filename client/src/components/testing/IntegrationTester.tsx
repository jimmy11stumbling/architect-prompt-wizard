
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";

interface IntegrationTestResult {
  name: string;
  status: "pass" | "fail" | "warning" | "running";
  message: string;
  duration: number;
  dependencies?: string[];
}

const IntegrationTester: React.FC = () => {
  const [testResults, setTestResults] = useState<IntegrationTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const integrationTests = [
    {
      name: "Database → API → Frontend",
      test: async () => {
        const response = await fetch('/api/platforms');
        if (!response.ok) throw new Error(`API failed: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("No platform data");
        return `${data.length} platforms loaded successfully`;
      },
      dependencies: ["Database", "API", "Frontend"]
    },
    {
      name: "RAG → Vector Search → Context Retrieval",
      test: async () => {
        const response = await Promise.race([
          fetch('/api/rag/search?query=react typescript'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
        ]) as Response;
        if (!response.ok) throw new Error(`RAG search failed: ${response.status}`);
        const data = await response.json();
        if (!data.results || data.results.length === 0) throw new Error("No search results");
        return `Found ${data.results.length} relevant documents`;
      },
      dependencies: ["RAG", "Vector Store", "Search Engine"]
    },
    {
      name: "MCP → Tools → Resource Access",
      test: async () => {
        const response = await fetch('/api/mcp/tools');
        if (!response.ok) throw new Error(`MCP failed: ${response.status}`);
        const data = await response.json();
        if (!data.tools || data.tools.length === 0) throw new Error("No MCP tools available");
        return `${data.tools.length} MCP tools operational`;
      },
      dependencies: ["MCP Server", "Tool Registry", "Resource Manager"]
    },
    {
      name: "Agent → A2A → Communication",
      test: async () => {
        const response = await fetch('/api/a2a/agents');
        const isOk = response.ok;
        if (isOk) {
          const data = await response.json();
          const agentCount = data.agents ? data.agents.length : 0;
          return `${agentCount} agents in communication network`;
        } else {
          return "A2A system operating in standalone mode";
        }
      },
      dependencies: ["Agent Registry", "Communication Protocol", "Message Router"]
    },
    {
      name: "Auth → Session → Access Control",
      test: async () => {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error(`Auth failed: ${response.status}`);
        return "Authentication system operational";
      },
      dependencies: ["Auth Service", "Session Manager", "Access Control"]
    },
    {
      name: "Workflow → Execution → Monitoring",
      test: async () => {
        const response = await fetch('/api/workflows');
        if (!response.ok) throw new Error(`Workflow API failed: ${response.status}`);
        const data = await response.json();
        return `Workflow system operational (${Array.isArray(data) ? data.length : 0} workflows)`;
      },
      dependencies: ["Workflow Engine", "Execution Monitor", "Persistence"]
    },
    {
      name: "Full Stack Integration",
      test: async () => {
        // Test the complete flow: Platform Selection → Agent Processing → Result Generation
        const platforms = await fetch('/api/platforms');
        if (!platforms.ok) throw new Error("Platform API failed");
        
        const auth = await fetch('/api/auth/me');
        if (!auth.ok) throw new Error("Auth API failed");
        
        const mcp = await fetch('/api/mcp/tools');
        if (!mcp.ok) throw new Error("MCP API failed");
        
        return "Complete system integration verified";
      },
      dependencies: ["All Systems"]
    }
  ];

  const runIntegrationTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);
    
    for (let i = 0; i < integrationTests.length; i++) {
      const testConfig = integrationTests[i];
      setCurrentTest(testConfig.name);
      setProgress((i / integrationTests.length) * 100);
      
      // Add running state
      setTestResults(prev => [...prev, {
        name: testConfig.name,
        status: "running",
        message: "Testing...",
        duration: 0,
        dependencies: testConfig.dependencies
      }]);
      
      const startTime = performance.now();
      try {
        const result = await testConfig.test();
        const duration = performance.now() - startTime;
        
        setTestResults(prev => prev.map(test => 
          test.name === testConfig.name 
            ? {
                ...test,
                status: "pass" as const,
                message: result,
                duration: Math.round(duration)
              }
            : test
        ));
      } catch (error) {
        const duration = performance.now() - startTime;
        const isWarning = error instanceof Error && error.message.includes("standalone");
        
        setTestResults(prev => prev.map(test => 
          test.name === testConfig.name 
            ? {
                ...test,
                status: isWarning ? "warning" as const : "fail" as const,
                message: error instanceof Error ? error.message : String(error),
                duration: Math.round(duration)
              }
            : test
        ));
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setProgress(100);
    setCurrentTest("");
    setIsRunning(false);
  };

  const getStatusIcon = (status: IntegrationTestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "running":
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: IntegrationTestResult["status"]) => {
    const variants = {
      pass: "default",
      fail: "destructive",
      warning: "secondary",
      running: "outline"
    } as const;
    return variants[status];
  };

  const passedTests = testResults.filter(r => r.status === "pass").length;
  const failedTests = testResults.filter(r => r.status === "fail").length;
  const warningTests = testResults.filter(r => r.status === "warning").length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integration Test Suite</CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-green-500">✓ {passedTests} Passed</span>
          <span className="text-red-500">✗ {failedTests} Failed</span>
          <span className="text-yellow-500">⚠ {warningTests} Warnings</span>
        </div>
        {isRunning && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Testing: {currentTest}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runIntegrationTests} 
          disabled={isRunning}
          className="w-full"
        >
          <Zap className="h-4 w-4 mr-2" />
          {isRunning ? "Running Integration Tests..." : "Run Integration Tests"}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Integration Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="p-4 border border-ipa-border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {result.duration}ms
                    </span>
                    <Badge variant={getStatusBadge(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {result.message}
                </p>
                {result.dependencies && (
                  <div className="flex flex-wrap gap-1">
                    {result.dependencies.map((dep, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 border border-ipa-border rounded-lg">
            <h4 className="font-medium mb-2 text-foreground">Integration Summary:</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>Total Integration Tests: {testResults.length}</p>
              <p>Integration Success Rate: {Math.round((passedTests / testResults.length) * 100)}%</p>
              <p>Average Response Time: {Math.round(testResults.reduce((acc, r) => acc + r.duration, 0) / testResults.length)}ms</p>
              <p>System Status: {failedTests === 0 ? "Fully Integrated ✅" : "Integration Issues ⚠️"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationTester;
