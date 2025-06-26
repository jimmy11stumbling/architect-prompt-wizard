
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Network, Wrench } from "lucide-react";
import { ReasonerResponse } from "@/services/deepseek/types";

interface ResponseTabsProps {
  response: ReasonerResponse;
}

const ResponseTabs: React.FC<ResponseTabsProps> = ({ response }) => {
  return (
    <Tabs defaultValue="answer" className="w-full">
      <TabsList>
        <TabsTrigger value="answer">Answer</TabsTrigger>
        <TabsTrigger value="reasoning">Chain of Thought</TabsTrigger>
        <TabsTrigger value="integration">Integration Data</TabsTrigger>
        <TabsTrigger value="metrics">Usage Metrics</TabsTrigger>
      </TabsList>

      <TabsContent value="answer">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              DeepSeek Response
              <Badge variant="outline">
                Conversation: {response.conversationId.slice(-8)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{response.answer}</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reasoning">
        <Card>
          <CardHeader>
            <CardTitle>Chain-of-Thought Reasoning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <div className="whitespace-pre-wrap font-mono text-sm">
                {response.reasoning}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="integration">
        <Card>
          <CardHeader>
            <CardTitle>Integration Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {response.integrationData?.ragResults && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  RAG Database Results
                </h4>
                <div className="text-sm text-muted-foreground">
                  Documents used: {response.integrationData.ragResults.documentsUsed || 0}
                </div>
              </div>
            )}

            {response.integrationData?.a2aMessages && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Network className="h-4 w-4 text-green-500" />
                  A2A Agent Coordination
                </h4>
                <div className="text-sm text-muted-foreground">
                  {response.integrationData.a2aMessages.length} agent messages exchanged
                </div>
              </div>
            )}

            {response.integrationData?.mcpToolCalls && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  MCP Tool Execution
                </h4>
                <div className="text-sm text-muted-foreground">
                  {response.integrationData.mcpToolCalls.length} tools executed
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="metrics">
        <Card>
          <CardHeader>
            <CardTitle>Usage Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {response.usage.promptTokens.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Prompt Tokens</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {response.usage.completionTokens.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Completion Tokens</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {response.usage.reasoningTokens.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Reasoning Tokens</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {response.usage.totalTokens.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Tokens</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded">
              <h4 className="font-medium mb-2">Model Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Model:</strong> deepseek-reasoner
                </div>
                <div>
                  <strong>Max Context:</strong> 64K tokens
                </div>
                <div>
                  <strong>Max Reasoning:</strong> 32K tokens
                </div>
                <div>
                  <strong>Max Output:</strong> 8K tokens
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ResponseTabs;
