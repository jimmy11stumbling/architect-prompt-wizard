import React, { useState, useEffect } from "react";
import { Wrench, FileText, MessageSquare, Play, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  clientName: string;
}

interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  clientName: string;
}

interface MCPClient {
  name: string;
  config: {
    serverName: string;
    transport: string;
    endpoint?: string;
  };
  ready: boolean;
}

export const MCPInterface: React.FC = () => {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [clients, setClients] = useState<MCPClient[]>([]);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [selectedResource, setSelectedResource] = useState<MCPResource | null>(null);
  const [toolArgs, setToolArgs] = useState<string>("{}");
  const [toolResult, setToolResult] = useState<any>(null);
  const [resourceContent, setResourceContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if MCP is already initialized by trying to fetch tools
    fetchTools();
  }, []);

  const initializeMCP = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/mcp/initialize", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
        setIsInitialized(true);
        toast({
          title: "MCP System Initialized",
          description: `Initialized ${data.clients?.length || 0} MCP clients`
        });
        await fetchTools();
        await fetchResources();
      } else {
        throw new Error("Failed to initialize MCP");
      }
    } catch (error) {
      toast({
        title: "MCP Initialization Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTools = async () => {
    try {
      const response = await fetch("/api/mcp/tools");
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
        setIsInitialized(data.tools?.length > 0);
      }
    } catch (error) {
      console.error("Error fetching MCP tools:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/mcp/resources");
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error("Error fetching MCP resources:", error);
    }
  };

  const callTool = async () => {
    if (!selectedTool) return;

    setLoading(true);
    try {
      let parsedArgs = {};
      if (toolArgs.trim()) {
        parsedArgs = JSON.parse(toolArgs);
      }

      const response = await fetch("/api/mcp/tools/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: selectedTool.clientName,
          toolName: selectedTool.name,
          arguments: parsedArgs
        })
      });

      if (response.ok) {
        const data = await response.json();
        setToolResult(data.result);
        toast({
          title: "Tool Executed Successfully",
          description: `${selectedTool.name} completed execution`
        });
      } else {
        throw new Error("Failed to call tool");
      }
    } catch (error) {
      toast({
        title: "Tool Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const readResource = async () => {
    if (!selectedResource) return;

    setLoading(true);
    try {
      const response = await fetch("/api/mcp/resources/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: selectedResource.clientName,
          uri: selectedResource.uri
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResourceContent(data.result);
        toast({
          title: "Resource Read Successfully",
          description: `Loaded content from ${selectedResource.name}`
        });
      } else {
        throw new Error("Failed to read resource");
      }
    } catch (error) {
      toast({
        title: "Resource Read Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateToolArgsTemplate = (tool: MCPTool) => {
    const template: any = {};
    
    if (tool.inputSchema.properties) {
      Object.entries(tool.inputSchema.properties).forEach(([key, schema]: [string, any]) => {
        if (schema.type === "string") {
          template[key] = schema.description ? `"${schema.description}"` : '""';
        } else if (schema.type === "number") {
          template[key] = 0;
        } else if (schema.type === "boolean") {
          template[key] = false;
        } else if (schema.type === "array") {
          template[key] = [];
        } else {
          template[key] = null;
        }
      });
    }

    return JSON.stringify(template, null, 2);
  };

  if (!isInitialized) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Model Context Protocol (MCP)
            </CardTitle>
            <CardDescription>
              Initialize the MCP system to enable standardized tool and resource access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={initializeMCP} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Initialize MCP System
            </Button>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">MCP provides:</h4>
              <ul className="text-sm space-y-1">
                <li>• Standardized tool execution across platforms</li>
                <li>• Resource access and management</li>
                <li>• JSON-RPC 2.0 messaging protocol</li>
                <li>• Secure client-server communication</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Model Context Protocol (MCP)
          </CardTitle>
          <CardDescription>
            Standardized tool and resource access for AI models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{tools.length}</div>
              <div className="text-sm text-muted-foreground">Available Tools</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{resources.length}</div>
              <div className="text-sm text-muted-foreground">Resources</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{clients.filter(c => c.ready).length}</div>
              <div className="text-sm text-muted-foreground">Active Clients</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            Tools ({tools.length})
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="h-4 w-4 mr-2" />
            Resources ({resources.length})
          </TabsTrigger>
          <TabsTrigger value="clients">
            <MessageSquare className="h-4 w-4 mr-2" />
            Clients ({clients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tool Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Available Tools</CardTitle>
                <CardDescription>
                  Select and execute MCP tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedTool?.name || ""}
                  onValueChange={(value) => {
                    const tool = tools.find(t => t.name === value);
                    setSelectedTool(tool || null);
                    if (tool) {
                      setToolArgs(generateToolArgsTemplate(tool));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {tools.map((tool) => (
                      <SelectItem key={`${tool.clientName}-${tool.name}`} value={tool.name}>
                        <div className="flex items-center gap-2">
                          <span>{tool.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {tool.clientName}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTool && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTool.description}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Arguments (JSON)</Label>
                      <Textarea
                        value={toolArgs}
                        onChange={(e) => setToolArgs(e.target.value)}
                        placeholder="Enter tool arguments as JSON"
                        className="mt-1 font-mono text-sm"
                        rows={6}
                      />
                    </div>

                    <Button 
                      onClick={callTool} 
                      disabled={loading}
                      className="w-full flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Execute Tool
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tool Result */}
            <Card>
              <CardHeader>
                <CardTitle>Tool Result</CardTitle>
                <CardDescription>
                  Output from the executed tool
                </CardDescription>
              </CardHeader>
              <CardContent>
                {toolResult ? (
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                    {typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select and execute a tool to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Available Resources</CardTitle>
                <CardDescription>
                  Access MCP resources and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedResource?.uri || ""}
                  onValueChange={(value) => {
                    const resource = resources.find(r => r.uri === value);
                    setSelectedResource(resource || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.uri} value={resource.uri}>
                        <div className="flex items-center gap-2">
                          <span>{resource.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {resource.clientName}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedResource && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">URI</Label>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">
                        {selectedResource.uri}
                      </p>
                    </div>

                    {selectedResource.description && (
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedResource.description}
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={readResource} 
                      disabled={loading}
                      className="w-full flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Read Resource
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resource Content */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Content</CardTitle>
                <CardDescription>
                  Data from the selected resource
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resourceContent ? (
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                    {typeof resourceContent === 'string' ? resourceContent : JSON.stringify(resourceContent, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select and read a resource to see content
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card key={client.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {client.name}
                    <Badge variant={client.ready ? "default" : "secondary"}>
                      {client.ready ? "Ready" : "Not Ready"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {client.config.serverName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Transport:</span> {client.config.transport}
                    </div>
                    {client.config.endpoint && (
                      <div>
                        <span className="font-medium">Endpoint:</span> {client.config.endpoint}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};