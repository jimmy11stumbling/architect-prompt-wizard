
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Code, FileText, Network, Database, Settings } from "lucide-react";
import { EnhancedResponse } from "@/services/integration/enhancedSystemService";

interface ResponseTabsProps {
  response: EnhancedResponse;
}

const ResponseTabs: React.FC<ResponseTabsProps> = ({ response }) => {
  return (
    <Tabs defaultValue="response" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="response" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Response
        </TabsTrigger>
        <TabsTrigger value="reasoning" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Reasoning
        </TabsTrigger>
        <TabsTrigger value="sources" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Sources
        </TabsTrigger>
        <TabsTrigger value="integration" className="flex items-center gap-2">
          <Network className="h-4 w-4" />
          Integration
        </TabsTrigger>
      </TabsList>

      <TabsContent value="response">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded max-h-96 overflow-y-auto">
                {response.response}
              </pre>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reasoning">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chain of Thought Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded max-h-96 overflow-y-auto">
                {response.reasoning || "No reasoning content available"}
              </pre>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sources">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  RAG Documents ({response.sources.ragDocuments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response.sources.ragDocuments?.map((doc, index) => (
                  <div key={index} className="mb-2 p-2 border rounded text-xs">
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-muted-foreground truncate">{doc.content}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  MCP Tools ({response.sources.mcpTools?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response.sources.mcpTools?.map((tool, index) => (
                  <div key={index} className="mb-2 p-2 border rounded text-xs">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-muted-foreground">{tool.description}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  A2A Agents ({response.sources.a2aAgents?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response.sources.a2aAgents?.map((agent, index) => (
                  <div key={index} className="mb-2 p-2 border rounded text-xs">
                    <div className="font-medium">{agent.name}</div>
                    <Badge variant="outline" className="mt-1">
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="integration">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm">RAG Integration</div>
                <div className="text-xs text-muted-foreground">
                  {response.sources.ragDocuments?.length || 0} docs
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm">A2A Protocol</div>
                <div className="text-xs text-muted-foreground">
                  {response.sources.a2aAgents?.length || 0} agents
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm">MCP Hub</div>
                <div className="text-xs text-muted-foreground">
                  {response.sources.mcpTools?.length || 0} tools
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">🧠</div>
                <div className="text-sm">DeepSeek Reasoner</div>
                <div className="text-xs text-muted-foreground">
                  ID: {response.conversationId.slice(-8)}
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
