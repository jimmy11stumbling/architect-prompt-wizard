import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MCPHubDemo from "../components/mcp/MCPHubDemo";
import MCPAdvancedInterface from "../components/mcp/MCPAdvancedInterface";

const MCPHubPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic MCP Hub</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <MCPHubDemo />
        </TabsContent>

        <TabsContent value="advanced">
          <MCPAdvancedInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MCPHubPage;