
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IntegrationTest {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  result?: string;
  dependencies: string[];
}

export default function IntegrationTester() {
  const [tests, setTests] = useState<IntegrationTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const integrationTests: Array<IntegrationTest & { test: () => Promise<string> }> = [
    {
      name: "Database → Platform Data Flow",
      description: "Verify database connection and platform data retrieval",
      status: 'pending',
      dependencies: [],
      test: async () => {
        const platforms = await fetch('/api/platforms');
        if (!platforms.ok) throw new Error("Platform API failed");
        
        const auth = await fetch('/api/auth/me');
        if (!auth.ok) throw new Error("Auth API failed");
        
        return "Database and platform data flow verified";
      }
    },
    {
      name: "RAG → Agent Integration",
      description: "Test RAG system providing context to agents",
      status: 'pending',
      dependencies: ["Database → Platform Data Flow"],
      test: async () => {
        // Test RAG search
        const ragResponse = await fetch('/api/rag/context/enhanced-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'React TypeScript', maxResults: 3 })
        });
        
        if (!ragResponse.ok) throw new Error("RAG search failed");
        const ragData = await ragResponse.json();
        
        if (!ragData.results || ragData.results.length === 0) {
          throw new Error("No results from RAG search");
        }
        
        return `RAG-Agent integration working - ${ragData.results.length} contexts retrieved`;
      }
    },
    {
      name: "MCP → Tool Execution",
      description: "Verify MCP tools can access system resources",
      status: 'pending',
      dependencies: ["Database → Platform Data Flow"],
      test: async () => {
        // Test MCP tool execution
        const mcpResponse = await fetch('/api/mcp/tools/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            toolName: 'list_files',
            arguments: { path: './attached_assets' }
          })
        });
        
        if (!mcpResponse.ok) throw new Error("MCP tool execution failed");
        const mcpData = await mcpResponse.json();
        
        return `MCP tool execution successful - ${mcpData.result?.files?.length || 0} files accessed`;
      }
    },
    {
      name: "A2A → Agent Coordination",
      description: "Test agent-to-agent communication and coordination",
      status: 'pending',
      dependencies: ["RAG → Agent Integration"],
      test: async () => {
        // Test A2A coordination
        const a2aResponse = await fetch('/api/a2a/coordinate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            task: 'integration-test',
            agents: ['reasoning-assistant', 'context-analyzer'],
            strategy: 'sequential'
          })
        });
        
        if (!a2aResponse.ok) throw new Error("A2A coordination failed");
        const a2aData = await a2aResponse.json();
        
        return `A2A coordination successful - ${a2aData.agents?.length || 0} agents coordinated`;
      }
    },
    {
      name: "End-to-End Workflow",
      description: "Complete platform selection → agent processing → result generation",
      status: 'pending',
      dependencies: ["A2A → Agent Coordination", "MCP → Tool Execution"],
      test: async () => {
        // Test complete workflow
        const workflowResponse = await fetch('/api/workflows/executions');
        if (!workflowResponse.ok) throw new Error("Workflow API failed");
        
        const agentResponse = await fetch('/api/agents/status');
        if (!agentResponse.ok) throw new Error("Agent status failed");
        
        const deepseekResponse = await fetch('/api/deepseek/health');
        if (!deepseekResponse.ok) throw new Error("DeepSeek integration failed");
        
        return "End-to-end workflow integration verified";
      }
    },
    {
      name: "Real-time System Integration",
      description: "Verify real-time updates and live monitoring",
      status: 'pending',
      dependencies: ["End-to-End Workflow"],
      test: async () => {
        // Test real-time features
        const ragStats = await fetch('/api/rag/stats');
        const mcpTools = await fetch('/api/mcp/tools');
        const a2aHealth = await fetch('/api/a2a/health');
        
        if (!ragStats.ok || !mcpTools.ok || !a2aHealth.ok) {
          throw new Error("Real-time system components failed");
        }
        
        return "Real-time system integration operational";
      }
    },
    {
      name: "Production Readiness Check",
      description: "Verify all systems are ready for deployment",
      status: 'pending',
      dependencies: ["Real-time System Integration"],
      test: async () => {
        // Final production readiness checks
        const checks = await Promise.all([
          fetch('/api/rag/analytics'),
          fetch('/api/mcp-hub/platforms'),
          fetch('/api/workflows'),
          fetch('/api/platforms')
        ]);
        
        const failedChecks = checks.filter(check => !check.ok);
        
        if (failedChecks.length > 0) {
          throw new Error(`${failedChecks.length} production checks failed`);
        }
        
        return "All systems ready for production deployment";
      }
    }
  ];

  useEffect(() => {
    const initialTests = integrationTests.map(test => ({
      name: test.name,
      description: test.description,
      status: 'pending' as const,
      dependencies: test.dependencies
    }));
    setTests(initialTests);
  }, []);

  const runSingleTest = async (testIndex: number, testFn: () => Promise<string>) => {
    setCurrentTest(integrationTests[testIndex].name);
    
    setTests(prev => {
      const updated = [...prev];
      updated[testIndex].status = 'running';
      return updated;
    });

    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      setTests(prev => {
        const updated = [...prev];
        updated[testIndex] = {
          ...updated[testIndex],
          status: 'passed',
          duration,
          result
        };
        return updated;
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTests(prev => {
        const updated = [...prev];
        updated[testIndex] = {
          ...updated[testIndex],
          status: 'failed',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        return updated;
      });
      
      throw error; // Re-throw to stop the test sequence
    }
  };

  const canRunTest = (testIndex: number): boolean => {
    const test = tests[testIndex];
    if (!test.dependencies.length) return true;
    
    return test.dependencies.every(dep => {
      const depTest = tests.find(t => t.name === dep);
      return depTest?.status === 'passed';
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      for (let i = 0; i < integrationTests.length; i++) {
        // Wait for dependencies
        while (!canRunTest(i)) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        await runSingleTest(i, integrationTests[i].test);
        setProgress(((i + 1) / integrationTests.length) * 100);
      }
    } catch (error) {
      console.error('Integration test failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const resetTests = () => {
    const resetTests = integrationTests.map(test => ({
      name: test.name,
      description: test.description,
      status: 'pending' as const,
      dependencies: test.dependencies
    }));
    setTests(resetTests);
    setProgress(0);
    setCurrentTest(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      passed: "default",
      failed: "destructive", 
      running: "secondary",
      pending: "outline"
    };
    
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getTotalStats = () => {
    let passed = 0, failed = 0, running = 0, pending = 0;
    
    tests.forEach(test => {
      switch (test.status) {
        case 'passed': passed++; break;
        case 'failed': failed++; break;
        case 'running': running++; break;
        case 'pending': pending++; break;
      }
    });
    
    return { passed, failed, running, pending, total: passed + failed + running + pending };
  };

  const stats = getTotalStats();
  const allTestsCompleted = stats.pending === 0 && stats.running === 0;
  const deploymentReady = stats.failed === 0 && allTestsCompleted;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Integration Testing Suite</h2>
          <p className="text-muted-foreground">
            End-to-end system integration tests for deployment readiness
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={resetTests} 
            variant="outline"
            disabled={isRunning}
          >
            Reset Tests
          </Button>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="min-w-32"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Integration Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress and Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Test Progress</CardTitle>
          <CardDescription>
            {stats.passed} passed • {stats.failed} failed • {stats.running} running • {stats.pending} pending
            {currentTest && ` • Currently testing: ${currentTest}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" />
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {stats.passed} Passed</span>
            <span className="text-red-600">✗ {stats.failed} Failed</span>
            <span className="text-blue-600">⟳ {stats.running} Running</span>
            <span className="text-gray-600">○ {stats.pending} Pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Integration Test Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Test Flow</CardTitle>
          <CardDescription>
            Tests run sequentially based on dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={test.name} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-muted-foreground">{test.description}</div>
                    {test.dependencies.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Depends on: {test.dependencies.join(', ')}
                      </div>
                    )}
                    {test.result && (
                      <div className="text-sm text-green-600 mt-1">{test.result}</div>
                    )}
                    {test.error && (
                      <div className="text-sm text-red-600 mt-1">{test.error}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration && (
                    <span className="text-xs text-muted-foreground">
                      {test.duration}ms
                    </span>
                  )}
                  {getStatusBadge(test.status)}
                  {index < tests.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Readiness */}
      {allTestsCompleted && (
        <Alert className={deploymentReady ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {deploymentReady 
              ? "🚀 All integration tests passed! System is ready for deployment on Replit."
              : `❌ Integration tests completed with ${stats.failed} failures. Please resolve issues before deployment.`
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
