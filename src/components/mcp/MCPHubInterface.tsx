
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, Server, PlayCircle, Settings, FileText, AlertCircle } from "lucide-react";
import { mcpService } from "@/services/mcp/mcpService";
import { MCPServer, MCPTool, MCPResource } from "@/types/ipa-types";
import { useToast } from "@/hooks/use-toast";

const MCPHubInterface: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toolCall, setToolCall] = useState({
    toolName: "",
    parameters: "{}"
  });
  const [resourceUri, setResourceUri] = useState("");
  const [toolResult, setToolResult] = useState<any>(null);
  const [resourceContent, setResourceContent] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [serverList, toolList, resourceList] = await Promise.all([
        mcpService.getServers(),
        mcpService.listTools(),
        mcpService.listResources()
      ]);
      
      setServers(serverList);
      setTools(toolList);
      setResources(resourceList);
    } catch (error) {
      console.error("Failed to fetch MCP data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch MCP hub data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const callTool = async () => {
    if (!toolCall.toolName) {
      toast({
        title: "Tool Required",
        description: "Please select a tool to call",
        variant: "destructive"
      });
      return;
    }

    try {
      let parameters;
      try {
        parameters = JSON.parse(toolCall.parameters);
      } catch {
        parameters = {};
      }

      const result = await mcpService.callTool(toolCall.toolName, parameters);
      setToolResult(result);
      
      toast({
        title: "Tool Called",
        description: `Successfully called ${toolCall.toolName}`
      });
    } catch (error) {
      console.error("Tool call failed:", error);
      toast({
        title: "Tool Call Failed",
        description: `Failed to call ${toolCall.toolName}`,
        variant: "destructive"
      });
    }
  };

  const readResource = async () => {
    if (!resourceUri) {
      toast({
        title: "URI Required",
        description: "Please enter a resource URI",
        variant: "destructive"
      });
      return;
    }

    try {
      const content = await mcpService.readResource(resourceUri);
      setResourceContent(content);
      
      toast({
        title: "Resource Read",
        description: "Successfully read resource content"
      });
    } catch (error) {
      console.error("Resource read failed:", error);
      toast({
        title: "Resource Read Failed",
        description: "Failed to read resource",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getServerStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-500";
      case "offline": return "text-red-500";
      case "error": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* MCP Hub Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            MCP Hub Status
          </CardTitle>
          <Button onClick={fetchData} disabled={isLoading} size="sm" variant="outline">
            <Settings className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{servers.length}</div>
              <div className="text-sm text-muted-foreground">MCP Servers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{tools.length}</div>
              <div className="text-sm text-muted-foreground">Available Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{resources.length}</div>
              <div className="text-sm text-muted-foreground">Resources</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="servers" className="w-full">
        <TabsList>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="execute">Execute</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          {servers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">No MCP Servers</h3>
                <p className="text-sm text-muted-foreground">
                  MCP servers will appear here once connected
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servers.map((server) => (
                <Card key={server.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{server.name}</CardTitle>
                      <Badge variant={server.status === "online" ? "default" : "secondary"}>
                        {server.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Server ID:</Label>
                        <div className="text-sm font-mono">{server.id}</div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Endpoint:</Label>
                        <div className="text-sm font-mono break-all">{server.endpoint}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold">{server.toolCount}</div>
                          <div className="text-xs text-muted-foreground">Tools</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{server.resourceCount}</div>
                          <div className="text-xs text-muted-foreground">Resources</div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Capabilities:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {server.capabilities.map((cap, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          {tools.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">No Tools Available</h3>
                <p className="text-sm text-muted-foreground">
                  MCP tools will appear here once servers are connected
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tools.map((tool) => (
                <Card key={tool.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      {tool.category && (
                        <Badge variant="outline">{tool.category}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                      
                      {tool.server && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Server:</Label>
                          <div className="text-sm">{tool.server}</div>
                        </div>
                      )}

                      {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Parameters:</Label>
                          <div className="mt-1 p-2 bg-muted rounded text-xs">
                            <pre>{JSON.stringify(tool.parameters, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => setToolCall(prev => ({ ...prev, toolName: tool.name }))}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Select for Execution
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {resources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">No Resources Available</h3>
                <p className="text-sm text-muted-foreground">
                  MCP resources will appear here once servers are connected
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">URI:</Label>
                        <div className="text-sm font-mono break-all">{resource.uri}</div>
                      </div>

                      {resource.mimeType && (
                        <div>
                          <Label className="text-xs text-muted-foreground">MIME Type:</Label>
                          <div className="text-sm">{resource.mimeType}</div>
                        </div>
                      )}

                      {resource.type && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Type:</Label>
                          <div className="text-sm">{resource.type}</div>
                        </div>
                      )}

                      <Button
                        onClick={() => setResourceUri(resource.uri)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Select for Reading
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="execute" className="space-y-6">
          {/* Tool Execution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Execute MCP Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tool-name">Tool Name</Label>
                <Input
                  id="tool-name"
                  placeholder="Enter tool name"
                  value={toolCall.toolName}
                  onChange={(e) => setToolCall(prev => ({ ...prev, toolName: e.target.value }))}
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {tools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setToolCall(prev => ({ ...prev, toolName: tool.name }))}
                      className="text-xs"
                    >
                      {tool.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parameters">Parameters (JSON)</Label>
                <Textarea
                  id="parameters"
                  placeholder='{"param1": "value1", "param2": "value2"}'
                  value={toolCall.parameters}
                  onChange={(e) => setToolCall(prev => ({ ...prev, parameters: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button onClick={callTool} className="w-full">
                <PlayCircle className="h-4 w-4 mr-2" />
                Execute Tool
              </Button>

              {toolResult && (
                <div className="mt-4 p-4 bg-muted rounded">
                  <Label className="text-sm font-medium">Tool Result:</Label>
                  <pre className="mt-2 text-xs whitespace-pre-wrap">
                    {JSON.stringify(toolResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resource Reading */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Read MCP Resource
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource-uri">Resource URI</Label>
                <Input
                  id="resource-uri"
                  placeholder="file:///path/to/resource or http://example.com/resource"
                  value={resourceUri}
                  onChange={(e) => setResourceUri(e.target.value)}
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {resources.map((resource, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setResourceUri(resource.uri)}
                      className="text-xs"
                    >
                      {resource.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={readResource} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Read Resource
              </Button>

              {resourceContent && (
                <div className="mt-4 p-4 bg-muted rounded">
                  <Label className="text-sm font-medium">Resource Content:</Label>
                  <pre className="mt-2 text-xs whitespace-pre-wrap">
                    {typeof resourceContent === 'string' 
                      ? resourceContent 
                      : JSON.stringify(resourceContent, null, 2)
                    }
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MCPHubInterface;
