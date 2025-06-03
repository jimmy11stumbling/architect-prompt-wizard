
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Play } from "lucide-react";
import { AgentName, ProjectSpec } from "@/types/ipa-types";
import { ResponseSimulator } from "@/services/ipa/api/responseSimulator";

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

        // Test criteria
        let status: "pass" | "fail" | "warning" = "pass";
        let message = "Agent response generated successfully";

        // Check response quality
        if (responseLength < 500) {
          status = "fail";
          message = "Response too short - likely incomplete";
        } else if (responseLength < 1000) {
          status = "warning";
          message = "Response shorter than expected";
        } else if (!responseContent.includes("#")) {
          status = "warning";
          message = "Response lacks proper markdown formatting";
        } else if (executionTime > 5000) {
          status = "warning";
          message = `Response generated but took ${Math.round(executionTime)}ms`;
        }

        // Agent-specific validation
        switch (agent) {
          case "RequirementDecompositionAgent":
            if (!responseContent.includes("Requirements") || !responseContent.includes("Architecture")) {
              status = "fail";
              message = "Missing key requirements analysis sections";
            }
            break;
          case "RAGContextIntegrationAgent":
            if (!responseContent.includes("Vector") || !responseContent.includes(testSpec.ragVectorDb)) {
              status = "fail";
              message = "Missing RAG/Vector database implementation details";
            }
            break;
          case "A2AProtocolExpertAgent":
            if (!responseContent.includes("Agent") || !responseContent.includes("Communication")) {
              status = "fail";
              message = "Missing A2A communication specifications";
            }
            break;
          case "TechStackImplementationAgent_Frontend":
            if (!testSpec.frontendTechStack.some(tech => responseContent.includes(tech))) {
              status = "fail";
              message = "Missing frontend tech stack implementation details";
            }
            break;
          case "TechStackImplementationAgent_Backend":
            if (!testSpec.backendTechStack.some(tech => responseContent.includes(tech))) {
              status = "fail";
              message = "Missing backend tech stack implementation details";
            }
            break;
          case "CursorOptimizationAgent":
            if (!responseContent.includes("Cursor") || !responseContent.includes("optimization")) {
              status = "fail";
              message = "Missing Cursor AI optimization guidance";
            }
            break;
          case "QualityAssuranceAgent":
            if (!responseContent.includes("Quality") || !responseContent.includes("Security")) {
              status = "fail";
              message = "Missing quality assurance and security analysis";
            }
            break;
        }

        results.push({
          agent,
          status,
          message,
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

      // Small delay between tests to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTestResults(results);
    setCurrentAgent(null);
    setIsRunning(false);
  };

  const getStatusIcon = (status: AgentTestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: AgentTestResult["status"]) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "fail":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    }
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
              <div key={result.agent} className="flex items-center justify-between p-3 border border-ipa-border rounded-lg bg-card">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium text-sm">{result.agent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    {result.responseLength} chars • {result.executionTime}ms
                  </div>
                  <span className="text-sm text-muted-foreground max-w-xs truncate">
                    {result.message}
                  </span>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 border border-ipa-border rounded-lg">
            <h4 className="font-medium mb-2 text-foreground">Test Summary:</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>Total Agents Tested: {testResults.length}</p>
              <p>Success Rate: {Math.round((passedTests / testResults.length) * 100)}%</p>
              <p>Average Response Length: {Math.round(testResults.reduce((acc, r) => acc + r.responseLength, 0) / testResults.length)} characters</p>
              <p>Average Response Time: {Math.round(testResults.reduce((acc, r) => acc + r.executionTime, 0) / testResults.length)}ms</p>
              <p>Status: {failedTests === 0 ? "All agents operational ✅" : "Issues detected ⚠️"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentResponseTester;
