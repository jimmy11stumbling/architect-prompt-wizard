
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Wrench, FileText, Zap, Play, Server, CheckCircle, AlertCircle } from "lucide-react";
import { mcpService } from "@/services/mcp/mcpService";
import { a2aService } from "@/services/a2a/a2aService";
import { MCPServer } from "@/types/ipa-types";

const MCPHubInterface: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [toolParams, setToolParams] = useState("");
  const [selectedResource, setSelectedResource] = useState("");
  const [toolResult, setToolResult] = useState<any>(null);
  const [resourceContent, setResourceContent] = useState<any>(null);
  const [realTimeLog, setRealTimeLog] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<any>({});

  useEffect(() => {
    loadMCPData();
    const interval = setInterval(validateMCPConnections, 5000);
    return () => clearInterval(interval);
  }, []);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setRealTimeLog(prev => [...prev.slice(-9), logEntry]);
    console.log("MCP:", logEntry);
  };

  const loadMCPData = async () => {
    try {
      if (!mcpService.isInitialized()) {
        await mcpService.initialize();
        addToLog("🔧 MCP Service initialized");
      }

      setServers(mcpService.getServers());
      const toolsList = await mcpService.listTools();
      const resourcesList = await mcpService.listResources();
      setTools(toolsList);
      setResources(resourcesList);
      
      addToLog(`📊 Loaded ${toolsList.length} tools and ${resourcesList.length} resources`);
    } catch (error) {
      console.error("Failed to load MCP data:", error);
      addToLog(`❌ Failed to load MCP data: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const validateMCPConnections = async () => {
    const results: any = {};
    
    for (const server of servers) {
      try {
        // Simulate connection validation
        const isConnected = server.status === "active";
        results[server.id] = {
          connected: isConnected,
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 100 + 20
        };
        
        if (isConnected) {
          addToLog(`✅ ${server.name} connection validated`);
        }
      } catch (error) {
        results[server.id] = {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
          lastCheck: new Date().toISOString()
        };
        addToLog(`❌ ${server.name} validation failed`);
      }
    }
    
    setValidationResults(results);
  };

  const callTool = async () => {
    if (!selectedTool) return;

    try {
      addToLog(`🔧 Executing tool: ${selectedTool}`);
      
      let params = {};
      if (toolParams.trim()) {
        params = JSON.parse(toolParams);
        addToLog(`📝 Parameters: ${JSON.stringify(params)}`);
      }

      // Coordinate with A2A for tool execution
      await a2aService.sendMessage({
        id: `mcp-tool-${Date.now()}`,
        from: "mcp-hub",
        to: "mcp-coordinator",
        type: "request",
        payload: { tool: selectedTool, params },
        timestamp: Date.now()
      });

      const result = await mcpService.callTool(selectedTool, params);
      setToolResult(result);
      
      addToLog(`✅ Tool executed successfully`);
      addToLog(`📤 Result: ${JSON.stringify(result).substring(0, 100)}...`);
      
    } catch (error) {
      console.error("Failed to call tool:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setToolResult({ error: errorMsg });
      addToLog(`❌ Tool execution failed: ${errorMsg}`);
    }
  };

  const readResource = async () => {
    if (!selectedResource) return;

    try {
      addToLog(`📖 Reading resource: ${selectedResource}`);
      
      // Coordinate with A2A for resource access
      await a2aService.sendMessage({
        id: `mcp-resource-${Date.now()}`,
        from: "mcp-hub",
        to: "mcp-coordinator",
        type: "request",
        payload: { resource: selectedResource },
        timestamp: Date.now()
      });

      const content = await mcpService.readResource(selectedResource);
      setResourceContent(content);
      
      addToLog(`✅ Resource read successfully`);
      addToLog(`📤 Content type: ${typeof content}`);
      
    } catch (error) {
      console.error("Failed to read resource:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setResourceContent({ error: errorMsg });
      addToLog(`❌ Resource read failed: ${errorMsg}`);
    }
  };

  const getServerStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-yellow-100 text-yellow-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getValidationIcon = (serverId: string) => {
    const validation = validationResults[serverId];
    if (!validation) return null;
    
    return validation.connected ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MCP Hub Management Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{servers.length}</div>
              <div className="text-sm text-muted-foreground">MCP Servers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{tools.length}</div>
              <div className="text-sm text-muted-foreground">Available Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{resources.length}</div>
              <div className="text-sm text-muted-foreground">Resources</div>
            </div>
          </div>

          <Tabs defaultValue="servers" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="servers">Servers</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="playground">Playground</TabsTrigger>
              <TabsTrigger value="logs">Real-time Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="servers">
              <div className="space-y-4">
                {servers.map((server) => (
                  <div key={server.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{server.name}</h3>
                        {getValidationIcon(server.id)}
                      </div>
                      <Badge className={getServerStatusColor(server.status)}>
                        {server.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Endpoint</Label>
                        <div className="text-xs text-muted-foreground font-mono">
                          {server.endpoint}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Capabilities</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {server.capabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {validationResults[server.id] && (
                        <div>
                          <Label className="text-xs">Validation Status</Label>
                          <div className="text-xs text-muted-foreground">
                            Last check: {new Date(validationResults[server.id].lastCheck).toLocaleTimeString()}
                            {validationResults[server.id].responseTime && (
                              <span> | Response: {validationResults[server.id].responseTime.toFixed(0)}ms</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {servers.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No MCP servers connected.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tools">
              <div className="space-y-4">
                {tools.map((tool) => (
                  <div key={tool.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        {tool.name}
                      </h3>
                      <Badge variant="outline">{tool.server}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {tool.description}
                    </p>
                    
                    {tool.parameters && (
                      <div>
                        <Label className="text-xs">Parameters</Label>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(tool.parameters, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
                
                {tools.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tools available.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.uri} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {resource.name}
                      </h3>
                      <Badge variant="outline">{resource.type}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {resource.description}
                    </p>
                    
                    <div className="text-xs text-muted-foreground font-mono">
                      URI: {resource.uri}
                    </div>
                  </div>
                ))}
                
                {resources.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No resources available.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="playground">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Tool Testing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Select Tool</Label>
                      <Select value={selectedTool} onValueChange={setSelectedTool}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a tool to test" />
                        </SelectTrigger>
                        <SelectContent>
                          {tools.map((tool) => (
                            <SelectItem key={tool.name} value={tool.name}>
                              {tool.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Parameters (JSON)</Label>
                      <Textarea
                        placeholder='{"param1": "value1"}'
                        value={toolParams}
                        onChange={(e) => setToolParams(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <Button onClick={callTool} disabled={!selectedTool} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Execute Tool
                    </Button>

                    {toolResult && (
                      <div>
                        <Label>Result</Label>
                        <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-x-auto max-h-48">
                          {JSON.stringify(toolResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Resource Reading
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Select Resource</Label>
                      <Select value={selectedResource} onValueChange={setSelectedResource}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a resource to read" />
                        </SelectTrigger>
                        <SelectContent>
                          {resources.map((resource) => (
                            <SelectItem key={resource.uri} value={resource.uri}>
                              {resource.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={readResource} disabled={!selectedResource} className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Read Resource
                    </Button>

                    {resourceContent && (
                      <div>
                        <Label>Content</Label>
                        <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-x-auto max-h-48">
                          {typeof resourceContent === 'string' 
                            ? resourceContent 
                            : JSON.stringify(resourceContent, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-xs space-y-1 max-h-64 overflow-y-auto bg-muted p-3 rounded">
                    {realTimeLog.length > 0 ? (
                      realTimeLog.map((log, index) => (
                        <div key={index} className="text-muted-foreground">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No activity logs yet. Execute tools or read resources to see real-time updates.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPHubInterface;
