
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AgentTestResult {
  agent: string;
  status: "pass" | "fail" | "warning";
  message: string;
  responseLength: number;
  executionTime: number;
}

interface TestResultProps {
  result: AgentTestResult;
}

const TestResult: React.FC<TestResultProps> = ({ result }) => {
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

  return (
    <div className="flex items-center justify-between p-3 border border-ipa-border rounded-lg bg-card">
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
  );
};

export default TestResult;
