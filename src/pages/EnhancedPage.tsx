
import React from "react";
import EnhancedQueryInterface from "@/components/enhanced-features/EnhancedQueryInterface";

const EnhancedPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Enhanced AI System</span>
        </h1>
        <p className="text-muted-foreground">
          Complete integration of RAG 2.0, A2A Protocol, MCP Hub, and DeepSeek Reasoner
        </p>
      </div>
      <EnhancedQueryInterface />
    </div>
  );
};

export default EnhancedPage;
