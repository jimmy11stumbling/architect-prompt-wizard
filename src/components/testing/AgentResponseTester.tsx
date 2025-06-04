
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { AgentName, ProjectSpec } from "@/types/ipa-types";
import { ResponseSimulator } from "@/services/ipa/api/responseSimulator";
import { AgentValidator } from "./agent-tester/AgentValidator";
import TestResult from "./agent-tester/TestResult";
import TestSummary from "./agent-tester/TestSummary";

interface AgentTestResult {
  agent: AgentName;
  status: "pass" | "fail" | "warning";
  message: string;
  responseLength: number;
  executionTime: number;
}

const AgentResponseTester: React.FC = () => {
  const [testResults, setTestResults] = useState<AgentTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentName | null>(null);

  const agents: AgentName[] = [
    "RequirementDecompositionAgent",
    "RAGContextIntegrationAgent", 
    "A2AProtocolExpertAgent",
    "TechStackImplementationAgent_Frontend",
    "TechStackImplementationAgent_Backend",
    "CursorOptimizationAgent",
    "QualityAssuranceAgent"
  ];

  const testSpec: ProjectSpec = {
    projectDescription: "A collaborative task management app with real-time updates and A2A communication",
    frontendTechStack: ["React", "Next.js"],
    backendTechStack: ["NestJS", "PostgreSQL"],
    customFrontendTech: ["TailwindCSS", "ShadCN UI"],
    customBackendTech: ["Redis Pub/Sub", "WebSockets"],
    a2aIntegrationDetails: "Real-time agent coordination with message queuing",
    additionalFeatures: "Advanced search with RAG integration, real-time notifications",
    ragVectorDb: "Pinecone",
    customRagVectorDb: "",
    mcpType: "Standard MCP",
    customMcpType: "",
    advancedPromptDetails: "Focus on production-ready code with comprehensive testing",
    deploymentPreference: "Vercel",
    authenticationMethod: "JWT"
  };

  const runAgentTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: AgentTestResult[] = [];

    for (const agent of agents) {
      setCurrentAgent(agent);
      
      try {
        const startTime = performance.now();
        const response = await ResponseSimulator.simulateResponse(agent, testSpec);
        const endTime = performance.now();
        
        const executionTime = endTime - startTime;
        const responseContent = response.choices[0]?.message?.content || "";
        const responseLength = responseContent.length;

        const validation = AgentValidator.validateResponse(
          agent, 
          responseContent, 
          responseLength, 
          executionTime, 
          testSpec
        );

        results.push({
          agent,
          status: validation.status,
          message: validation.message,
          responseLength,
          executionTime: Math.round(executionTime)
        });

      } catch (error) {
        results.push({
          agent,
          status: "fail",
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
          responseLength: 0,
          executionTime: 0
        });
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTestResults(results);
    setCurrentAgent(null);
    setIsRunning(false);
  };

  const passedTests = testResults.filter(r => r.status === "pass").length;
  const failedTests = testResults.filter(r => r.status === "fail").length;
  const warningTests = testResults.filter(r => r.status === "warning").length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agent Response Test Suite</CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-green-500">✓ {passedTests} Passed</span>
          <span className="text-red-500">✗ {failedTests} Failed</span>
          <span className="text-yellow-500">⚠ {warningTests} Warnings</span>
        </div>
        {currentAgent && (
          <div className="text-sm text-muted-foreground">
            Currently testing: {currentAgent}...
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runAgentTests} 
          disabled={isRunning}
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          {isRunning ? "Testing Agent Responses..." : "Test All Agent Responses"}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Agent Test Results:</h3>
            {testResults.map((result) => (
              <TestResult key={result.agent} result={result} />
            ))}
          </div>
        )}

        {testResults.length > 0 && <TestSummary testResults={testResults} />}
      </CardContent>
    </Card>
  );
};

export default AgentResponseTester;
