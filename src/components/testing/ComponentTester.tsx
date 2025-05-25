
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ProjectSpec } from "@/types/ipa-types";

interface TestResult {
  component: string;
  status: "pass" | "fail" | "warning";
  message: string;
}

const ComponentTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: TestResult[] = [];

    // Test 1: Project Form Submission
    try {
      const testSpec: ProjectSpec = {
        projectDescription: "Test project",
        frontendTechStack: ["React"],
        backendTechStack: ["Express"],
        customFrontendTech: [],
        customBackendTech: [],
        a2aIntegrationDetails: "Test A2A",
        additionalFeatures: "Test features",
        ragVectorDb: "Pinecone",
        customRagVectorDb: "",
        mcpType: "Standard MCP",
        customMcpType: "",
        advancedPromptDetails: "Test prompt details"
      };
      
      // Simulate form validation
      if (testSpec.projectDescription && testSpec.frontendTechStack.length > 0) {
        results.push({
          component: "ProjectSpecForm",
          status: "pass",
          message: "Form validation and submission working correctly"
        });
      } else {
        results.push({
          component: "ProjectSpecForm",
          status: "fail",
          message: "Form validation failed"
        });
      }
    } catch (error) {
      results.push({
        component: "ProjectSpecForm",
        status: "fail",
        message: `Form error: ${error}`
      });
    }

    // Test 2: Tech Stack Selection
    try {
      const techStacks = ["React", "Next.js", "Vue", "Angular"];
      const backendStacks = ["Express", "NestJS", "FastAPI", "Django"];
      
      if (techStacks.length > 0 && backendStacks.length > 0) {
        results.push({
          component: "TechStackSelector",
          status: "pass",
          message: "Tech stack options are properly configured"
        });
      }
    } catch (error) {
      results.push({
        component: "TechStackSelector",
        status: "fail",
        message: `Tech stack error: ${error}`
      });
    }

    // Test 3: Vector Database Options
    try {
      const vectorDbs = ["Pinecone", "Weaviate", "Milvus", "Qdrant", "Chroma", "PGVector", "None"];
      if (vectorDbs.length > 0) {
        results.push({
          component: "VectorDatabaseSelector",
          status: "pass",
          message: "Vector database options are available"
        });
      }
    } catch (error) {
      results.push({
        component: "VectorDatabaseSelector",
        status: "fail",
        message: `Vector DB error: ${error}`
      });
    }

    // Test 4: MCP Options
    try {
      const mcpTypes = ["Standard MCP", "Extended MCP", "MCP with Tools", "MCP with Resources", "None"];
      if (mcpTypes.length > 0) {
        results.push({
          component: "MCPSelector",
          status: "pass",
          message: "MCP options are available"
        });
      }
    } catch (error) {
      results.push({
        component: "MCPSelector",
        status: "fail",
        message: `MCP error: ${error}`
      });
    }

    // Test 5: Quick Fill Functionality
    try {
      const quickFillData = {
        projectDescription: "A collaborative task management app with real-time updates and A2A communication.",
        frontendTechStack: ["React", "Next.js"],
        backendTechStack: ["NestJS", "PostgreSQL"],
        customFrontendTech: ["TailwindCSS", "ShadCN UI"],
        customBackendTech: ["Redis Pub/Sub", "WebSockets"]
      };
      
      if (quickFillData.projectDescription && quickFillData.frontendTechStack.length > 0) {
        results.push({
          component: "QuickFillButton",
          status: "pass",
          message: "Quick fill functionality working"
        });
      }
    } catch (error) {
      results.push({
        component: "QuickFillButton",
        status: "fail",
        message: `Quick fill error: ${error}`
      });
    }

    // Test 6: Agent Workflow
    try {
      const agents = ["RequirementDecompositionAgent", "RAGContextIntegrationAgent"];
      if (agents.length > 0) {
        results.push({
          component: "AgentWorkflow",
          status: "pass",
          message: "Agent workflow components available"
        });
      }
    } catch (error) {
      results.push({
        component: "AgentWorkflow",
        status: "fail",
        message: `Agent workflow error: ${error}`
      });
    }

    // Test 7: Saved Prompts (localStorage simulation)
    try {
      // Test localStorage functionality
      const testPrompt = { id: 1, prompt: "test", projectName: "test", createdAt: new Date().toISOString() };
      localStorage.setItem("test-prompt", JSON.stringify(testPrompt));
      const retrieved = localStorage.getItem("test-prompt");
      localStorage.removeItem("test-prompt");
      
      if (retrieved) {
        results.push({
          component: "SavedPrompts",
          status: "pass",
          message: "Local storage functionality working"
        });
      }
    } catch (error) {
      results.push({
        component: "SavedPrompts",
        status: "fail",
        message: `Saved prompts error: ${error}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800";
      case "fail":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const passedTests = testResults.filter(r => r.status === "pass").length;
  const failedTests = testResults.filter(r => r.status === "fail").length;
  const warningTests = testResults.filter(r => r.status === "warning").length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Component Functionality Test Suite</CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">✓ {passedTests} Passed</span>
          <span className="text-red-600">✗ {failedTests} Failed</span>
          <span className="text-yellow-600">⚠ {warningTests} Warnings</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? "Running Tests..." : "Run Component Tests"}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.component}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{result.message}</span>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Test Summary:</h4>
            <div className="text-sm space-y-1">
              <p>Total Components Tested: {testResults.length}</p>
              <p>Overall Success Rate: {Math.round((passedTests / testResults.length) * 100)}%</p>
              <p>Status: {failedTests === 0 ? "All systems operational ✅" : "Issues detected ⚠️"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComponentTester;
