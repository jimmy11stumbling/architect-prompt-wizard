
import React from "react";

interface AgentTestResult {
  agent: string;
  status: "pass" | "fail" | "warning";
  message: string;
  responseLength: number;
  executionTime: number;
}

interface TestSummaryProps {
  testResults: AgentTestResult[];
}

const TestSummary: React.FC<TestSummaryProps> = ({ testResults }) => {
  const passedTests = testResults.filter(r => r.status === "pass").length;
  const failedTests = testResults.filter(r => r.status === "fail").length;
  const warningTests = testResults.filter(r => r.status === "warning").length;

  return (
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
  );
};

export default TestSummary;
