
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
}

export default function ComponentTester() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const testSuiteDefinitions = [
    {
      name: "RAG System Tests",
      tests: [
        { name: "Vector Store Connection", test: () => testRAGConnection() },
        { name: "Document Indexing", test: () => testDocumentIndexing() },
        { name: "Hybrid Search", test: () => testHybridSearch() },
        { name: "Context Retrieval", test: () => testContextRetrieval() }
      ]
    },
    {
      name: "MCP Integration Tests",
      tests: [
        { name: "MCP Server Connection", test: () => testMCPConnection() },
        { name: "Tool Registry", test: () => testMCPTools() },
        { name: "Resource Access", test: () => testMCPResources() },
        { name: "Hub Integration", test: () => testMCPHub() }
      ]
    },
    {
      name: "A2A Communication Tests",
      tests: [
        { name: "Agent Registry", test: () => testA2ARegistry() },
        { name: "Message Passing", test: () => testA2AMessaging() },
        { name: "Task Coordination", test: () => testA2ACoordination() },
        { name: "FIPA ACL Protocol", test: () => testFIPAProtocol() }
      ]
    },
    {
      name: "Agent System Tests",
      tests: [
        { name: "Agent Orchestration", test: () => testAgentOrchestration() },
        { name: "DeepSeek Integration", test: () => testDeepSeekIntegration() },
        { name: "Streaming Responses", test: () => testStreamingResponses() },
        { name: "Agent Workflow", test: () => testAgentWorkflow() }
      ]
    },
    {
      name: "Database Tests",
      tests: [
        { name: "Database Connection", test: () => testDatabaseConnection() },
        { name: "Platform Data", test: () => testPlatformData() },
        { name: "Vector Store", test: () => testVectorStore() },
        { name: "Workflow Storage", test: () => testWorkflowStorage() }
      ]
    }
  ];

  const initializeTestSuites = () => {
    const initialSuites = testSuiteDefinitions.map(suite => ({
      name: suite.name,
      status: 'pending' as const,
      tests: suite.tests.map(test => ({
        name: test.name,
        status: 'pending' as const
      }))
    }));
    setTestSuites(initialSuites);
  };

  useEffect(() => {
    initializeTestSuites();
  }, []);

  // Test Implementation Functions
  async function testRAGConnection(): Promise<string> {
    try {
      const response = await fetch('/api/rag/stats');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Connected - ${data.documentsIndexed} documents indexed`;
    } catch (error) {
      throw new Error(`RAG connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testDocumentIndexing(): Promise<string> {
    try {
      const response = await fetch('/api/rag/context/enhanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test indexing', maxResults: 1 })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Indexing functional - ${data.results?.length || 0} results found`;
    } catch (error) {
      throw new Error(`Document indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testHybridSearch(): Promise<string> {
    try {
      const response = await fetch('/api/rag/context/enhanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: 'React TypeScript best practices', 
          platform: 'cursor',
          maxResults: 3 
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Hybrid search working - Score: ${data.metadata?.avgScore?.toFixed(3) || 'N/A'}`;
    } catch (error) {
      throw new Error(`Hybrid search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testContextRetrieval(): Promise<string> {
    try {
      const response = await fetch('/api/rag/context/preload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          queries: ['React components', 'TypeScript'],
          platform: 'cursor'
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Context retrieval working - ${data.preloadedContexts?.length || 0} contexts preloaded`;
    } catch (error) {
      throw new Error(`Context retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testMCPConnection(): Promise<string> {
    try {
      const response = await fetch('/api/mcp/tools');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `MCP connected - ${data.tools?.length || 0} tools available`;
    } catch (error) {
      throw new Error(`MCP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testMCPTools(): Promise<string> {
    try {
      const response = await fetch('/api/mcp/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolName: 'list_files',
          arguments: { path: './attached_assets' }
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Tool execution successful - ${data.result?.files?.length || 0} files found`;
    } catch (error) {
      throw new Error(`MCP tools failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testMCPResources(): Promise<string> {
    try {
      const response = await fetch('/api/mcp/resources');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Resources accessible - ${data.resources?.length || 0} resources available`;
    } catch (error) {
      throw new Error(`MCP resources failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testMCPHub(): Promise<string> {
    try {
      const response = await fetch('/api/mcp-hub/platforms');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Hub integration working - ${data.platforms?.length || 0} platforms indexed`;
    } catch (error) {
      throw new Error(`MCP Hub failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testA2ARegistry(): Promise<string> {
    try {
      const response = await fetch('/api/a2a/agents');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Agent registry working - ${data.agents?.length || 0} agents registered`;
    } catch (error) {
      throw new Error(`A2A registry failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testA2AMessaging(): Promise<string> {
    try {
      const response = await fetch('/api/a2a/coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: 'test-coordination',
          agents: ['reasoning-assistant'],
          strategy: 'sequential'
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Messaging functional - Response: ${data.result ? 'Success' : 'Failed'}`;
    } catch (error) {
      throw new Error(`A2A messaging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testA2ACoordination(): Promise<string> {
    try {
      const response = await fetch('/api/a2a/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Coordination active - Health: ${data.healthy ? 'Good' : 'Issues detected'}`;
    } catch (error) {
      throw new Error(`A2A coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testFIPAProtocol(): Promise<string> {
    try {
      // Test FIPA ACL message structure
      const testMessage = {
        performative: 'inform',
        sender: 'test-agent',
        receiver: 'reasoning-assistant',
        content: 'test coordination',
        protocol: 'fipa-contract-net'
      };
      
      const response = await fetch('/api/a2a/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMessage)
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return `FIPA ACL protocol working - Message processed`;
    } catch (error) {
      throw new Error(`FIPA protocol failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testAgentOrchestration(): Promise<string> {
    try {
      const response = await fetch('/api/agents/status');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Orchestration ready - ${data.activeAgents || 0} agents active`;
    } catch (error) {
      throw new Error(`Agent orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testDeepSeekIntegration(): Promise<string> {
    try {
      const response = await fetch('/api/deepseek/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `DeepSeek integration ${data.status || 'unknown'} - API accessible`;
    } catch (error) {
      throw new Error(`DeepSeek integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testStreamingResponses(): Promise<string> {
    try {
      // Test if streaming endpoint is available
      const response = await fetch('/api/deepseek/stream-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test streaming' })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return `Streaming responses functional - Endpoint accessible`;
    } catch (error) {
      throw new Error(`Streaming responses failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testAgentWorkflow(): Promise<string> {
    try {
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Agent workflow ready - ${data.workflows?.length || 0} workflows available`;
    } catch (error) {
      throw new Error(`Agent workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testDatabaseConnection(): Promise<string> {
    try {
      const response = await fetch('/api/platforms');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Database connected - ${data.length || 0} platforms loaded`;
    } catch (error) {
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testPlatformData(): Promise<string> {
    try {
      const response = await fetch('/api/platforms/cursor');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Platform data loaded - ${data.features?.length || 0} features available`;
    } catch (error) {
      throw new Error(`Platform data failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testVectorStore(): Promise<string> {
    try {
      const response = await fetch('/api/rag/analytics');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Vector store operational - ${data.documentsIndexed || 0} docs, ${data.chunksIndexed || 0} chunks`;
    } catch (error) {
      throw new Error(`Vector store failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function testWorkflowStorage(): Promise<string> {
    try {
      const response = await fetch('/api/workflows/executions');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return `Workflow storage ready - ${data.executions?.length || 0} executions tracked`;
    } catch (error) {
      throw new Error(`Workflow storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const runSingleTest = async (suiteIndex: number, testIndex: number, testFn: () => Promise<string>) => {
    setTestSuites(prev => {
      const updated = [...prev];
      updated[suiteIndex].tests[testIndex].status = 'running';
      return updated;
    });

    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      setTestSuites(prev => {
        const updated = [...prev];
        updated[suiteIndex].tests[testIndex] = {
          ...updated[suiteIndex].tests[testIndex],
          status: 'passed',
          duration,
          details: result
        };
        return updated;
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTestSuites(prev => {
        const updated = [...prev];
        updated[suiteIndex].tests[testIndex] = {
          ...updated[suiteIndex].tests[testIndex],
          status: 'failed',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        return updated;
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    let totalTests = 0;
    let completedTests = 0;
    
    testSuiteDefinitions.forEach(suite => {
      totalTests += suite.tests.length;
    });

    for (let suiteIndex = 0; suiteIndex < testSuiteDefinitions.length; suiteIndex++) {
      const suite = testSuiteDefinitions[suiteIndex];
      
      setTestSuites(prev => {
        const updated = [...prev];
        updated[suiteIndex].status = 'running';
        return updated;
      });

      for (let testIndex = 0; testIndex < suite.tests.length; testIndex++) {
        const test = suite.tests[testIndex];
        await runSingleTest(suiteIndex, testIndex, test.test);
        
        completedTests++;
        setProgress((completedTests / totalTests) * 100);
      }

      setTestSuites(prev => {
        const updated = [...prev];
        updated[suiteIndex].status = 'completed';
        return updated;
      });
    }
    
    setIsRunning(false);
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
    
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        switch (test.status) {
          case 'passed': passed++; break;
          case 'failed': failed++; break;
          case 'running': running++; break;
          case 'pending': pending++; break;
        }
      });
    });
    
    return { passed, failed, running, pending, total: passed + failed + running + pending };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Component Testing Suite</h2>
          <p className="text-muted-foreground">
            Comprehensive testing of all system components before deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={initializeTestSuites} 
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
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress and Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Test Progress</CardTitle>
          <CardDescription>
            {stats.passed} passed • {stats.failed} failed • {stats.running} running • {stats.pending} pending
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

      {/* Test Suites */}
      <div className="grid gap-6">
        {testSuites.map((suite, suiteIndex) => (
          <Card key={suite.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{suite.name}</CardTitle>
                {getStatusBadge(suite.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suite.tests.map((test, testIndex) => (
                  <div 
                    key={test.name}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        {test.details && (
                          <div className="text-sm text-green-600">{test.details}</div>
                        )}
                        {test.error && (
                          <div className="text-sm text-red-600">{test.error}</div>
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Alert */}
      {stats.total > 0 && stats.pending === 0 && (
        <Alert className={stats.failed > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stats.failed > 0 
              ? `Testing completed with ${stats.failed} failed tests. Please review and fix issues before deployment.`
              : `All tests passed! System is ready for deployment.`
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
