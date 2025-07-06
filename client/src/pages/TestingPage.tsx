
import React from "react";
import { ComponentTester, AgentResponseTester } from "@/components/testing";
import SystemDiagnostics from "@/components/diagnostics/SystemDiagnostics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TestingPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Testing & Diagnostics Suite</span>
        </h1>
        <p className="text-muted-foreground">
          Monitor system health, test components, and validate agent responses
        </p>
      </div>
      
      <Tabs defaultValue="diagnostics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnostics">System Diagnostics</TabsTrigger>
          <TabsTrigger value="component-tests">Component Tests</TabsTrigger>
          <TabsTrigger value="agent-tests">Agent Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnostics">
          <SystemDiagnostics />
        </TabsContent>
        
        <TabsContent value="component-tests">
          <ComponentTester />
        </TabsContent>
        
        <TabsContent value="agent-tests">
          <AgentResponseTester />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingPage;
