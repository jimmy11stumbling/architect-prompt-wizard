
import React from "react";
import MCPHubInterface from "@/components/mcp/MCPHubInterface";

const MCPPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">MCP Hub Control</span>
        </h1>
        <p className="text-muted-foreground">
          Manage Model Context Protocol servers, tools, and resources
        </p>
      </div>
      <MCPHubInterface />
    </div>
  );
};

export default MCPPage;
