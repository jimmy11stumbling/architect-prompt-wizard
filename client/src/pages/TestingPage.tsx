
import React from "react";
import { ComponentTester, AgentResponseTester } from "@/components/testing";

const TestingPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Testing Suite</span>
        </h1>
        <p className="text-muted-foreground">
          Test and validate system components and agent responses
        </p>
      </div>
      <div className="space-y-8">
        <AgentResponseTester />
        <ComponentTester />
      </div>
    </div>
  );
};

export default TestingPage;
