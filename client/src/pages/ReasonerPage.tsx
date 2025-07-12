import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Database, Network, Wrench } from "lucide-react";
import { DeepSeekReasonerPanel } from "@/components/enhanced-features/DeepSeekReasonerPanel";
import AttachedAssetsPanel from "@/components/deepseek/AttachedAssetsPanel";
import DeepDiveAssetsExplorer from "@/components/deepseek/DeepDiveAssetsExplorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReasonerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-gradient">DeepSeek Reasoner</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Advanced Chain-of-Thought reasoning with integrated RAG 2.0, A2A protocol, and MCP tools for comprehensive AI-powered analysis
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                Chain-of-Thought
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access to the complete reasoning process with up to 32K reasoning tokens, 
                providing transparency into how conclusions are reached.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5 text-blue-500" />
                RAG Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Seamlessly retrieves relevant documentation and context from the RAG 2.0 
                database to enhance reasoning accuracy and relevance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Network className="h-5 w-5 text-green-500" />
                A2A & MCP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coordinates with other agents via A2A protocol and utilizes MCP tools 
                for comprehensive task execution and resource access.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Reasoner Interface */}
        
      <Tabs defaultValue="reasoner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reasoner">DeepSeek Reasoner</TabsTrigger>
          <TabsTrigger value="assets">Attached Assets</TabsTrigger>
          <TabsTrigger value="deepdive">Deep Dive Explorer</TabsTrigger>
        </TabsList>

        <TabsContent value="reasoner" className="space-y-4">
          <DeepSeekReasonerPanel />
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <AttachedAssetsPanel 
            isEnabled={true} 
            onToggle={() => {}} 
          />
        </TabsContent>

        <TabsContent value="deepdive" className="space-y-4">
          <DeepDiveAssetsExplorer />
        </TabsContent>
      </Tabs>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium">Model</div>
                <div className="text-muted-foreground">deepseek-reasoner</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Max Context</div>
                <div className="text-muted-foreground">64K tokens</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Max Reasoning</div>
                <div className="text-muted-foreground">32K tokens</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Max Output</div>
                <div className="text-muted-foreground">15K tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReasonerPage;