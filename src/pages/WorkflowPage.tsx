
import React from "react";
import IntegratedWorkflow from "@/components/enhanced-features/IntegratedWorkflow";

const WorkflowPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Integrated Workflow Engine</span>
        </h1>
        <p className="text-muted-foreground">
          Execute end-to-end AI workflows combining RAG, A2A, MCP, and DeepSeek Reasoner
        </p>
      </div>
      <IntegratedWorkflow />
    </div>
  );
};

export default WorkflowPage;
