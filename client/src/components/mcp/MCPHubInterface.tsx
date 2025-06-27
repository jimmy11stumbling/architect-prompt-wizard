
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Wrench, 
  Database, 
  Play, 
  Server, 
  CheckCircle, 
  XCircle,
  Plus,
  Trash2,
  RefreshCw
} from "lucide-react";
import { MCPServer, MCPTool, MCPResource } from "@/types/ipa-types";
import { useToast } from "@/hooks/use-toast";

const MCPHubInterface: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [toolParams, setToolParams] = useState<string>("");
  const [toolResult, setToolResult] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMCPServers();
    loadMCPTools();
    loadMCPResources();
  }, []);

  const loadMCPServers = async () => {
    const mockServers: MCPServer[] = [
      {
        id: "web-search-server",
        name: "Web Search Server",
        status: "online",
        endpoint: "http://localhost:8080/mcp",
        toolCount: 3,
        resourceCount: 0,
        capabilities: ["web_search", "url_fetch", "content_extract"]
      },
      {
        id: "database-server",
        name: "Database Server",
        status: "online",
        endpoint: "http://localhost:8081/mcp",
        toolCount: 5,
        resourceCount: 12,
        capabilities: ["sql_query", "data_insert", "data_update", "schema_info"]
      },
      {
        id: "file-system-server",
        name: "File System Server",
        status: "offline",
        endpoint: "http://localhost:8082/mcp",
        toolCount: 4,
        resourceCount: 8,
        capabilities: ["file_read", "file_write", "directory_list", "file_delete"]
      }
    ];
    
    setServers(mockServers);
    if (!selectedServer && mockServers.length > 0) {
      setSelectedServer(mockServers[0]);
    }
  };

  const loadMCPTools = async () => {
    const mockTools: MCPTool[] = [
      {
        id: "web_search",
        name: "Web Search",
        description: "Search the web for information",
        parameters: {
          query: { type: "string", description: "Search query" },
          limit: { type: "number", description: "Number of results", default: 10 }
        },
        category: "search",
        server: "web-search-server"
      },
      {
        id: "sql_query",
        name: "SQL Query",
        description: "Execute SQL queries on the database",
        parameters: {
          query: { type: "string", description: "SQL query to execute" },
          database: { type: "string", description: "Target database name" }
        },
        category: "database",
        server: "database-server"
      },
      {
        id: "file_read",
        name: "File Read",
        description: "Read contents of a file",
        parameters: {
          path: { type: "string", description: "File path to read" },
          encoding: { type: "string", description: "File encoding", default: "utf-8" }
        },
        category: "filesystem",
        server: "file-system-server"
      }
    ];
    
    setTools(mockTools);
  };

  const loadMCPResources = async () => {
    const mockResources: MCPResource[] = [
      {
        uri: "database://users",
        name: "Users Table",
        description: "User account information",
        mimeType: "application/sql",
        type: "table"
      },
      {
        uri: "file:///docs/readme.md",
        name: "Project README",
        description: "Main project documentation",
        mimeType: "text/markdown",
        type: "document"
      },
      {
        uri: "api://config/settings",
        name: "Application Settings",
        description: "Configuration parameters",
        mimeType: "application/json",
        type: "config"
      }
    ];
    
    setResources(mockResources);
  };

  const executeTool = async () => {
    if (!selectedTool) {
      toast({
        title: "No Tool Selected",
        description: "Please select a tool to execute",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    try {
      let params = {};
      if (toolParams.trim()) {
        params = JSON.parse(toolParams);
      }

      // Mock tool execution
      const mockResult = {
        tool: selectedTool.name,
        parameters: params,
        result: `Mock result for ${selectedTool.name}`,
        timestamp: new Date().toISOString(),
        executionTime: Math.random() * 1000 + 100
      };

      setTimeout(() => {
        setToolResult(JSON.stringify(mockResult, null, 2));
        setIsExecuting(false);
        
        toast({
          title: "Tool Executed",
          description: `${selectedTool.name} executed successfully`
        });
      }, 1000);

    } catch (error) {
      console.error("Tool execution failed:", error);
      setIsExecuting(false);
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const getServerStatusIcon = (status: string) => {
    return status === "online" ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "search": return "bg-blue-100 text-blue-800";
      case "database": return "bg-green-100 text-green-800";
      case "filesystem": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MCP Hub Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{servers.length}</div>
              <div className="text-sm text-muted-foreground">MCP Servers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{tools.length}</div>
              <div className="text-sm text-muted-foreground">Available Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{resources.length}</div>
              <div className="text-sm text-muted-foreground">Resources</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="servers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="execute">Execute</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">MCP Servers</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((server) => (
              <Card key={server.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {server.name}
                    </div>
                    {getServerStatusIcon(server.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge 
                        variant={server.status === "online" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {server.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tools:</span>
                        <span className="ml-2">{server.toolCount}</span>
                      </div>
                      <div>
                        <span className="font-medium">Resources:</span>
                        <span className="ml-2">{server.resourceCount}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium mb-2 block">Capabilities:</span>
                      <div className="flex flex-wrap gap-1">
                        {server.capabilities.map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Endpoint:</span> {server.endpoint}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Tools</h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <Card 
                key={tool.id}
                className={`cursor-pointer transition-colors ${
                  selectedTool?.id === tool.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedTool(tool)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      {tool.name}
                    </div>
                    {tool.category && (
                      <Badge className={getCategoryColor(tool.category)}>
                        {tool.category}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                    
                    <div>
                      <span className="text-sm font-medium mb-2 block">Parameters:</span>
                      <div className="space-y-1">
                        {Object.entries(tool.parameters).map(([key, param]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium">{key}:</span>
                            <span className="ml-1 text-muted-foreground">
                              {typeof param === 'object' ? param.description : String(param)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {tool.server && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Server:</span> {tool.server}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Resources</h3>
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Refresh Resources
            </Button>
          </div>
          
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">{resource.name}</span>
                        {resource.type && (
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {resource.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span><strong>URI:</strong> {resource.uri}</span>
                        {resource.mimeType && (
                          <span><strong>Type:</strong> {resource.mimeType}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="execute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Execute MCP Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tool-select">Select Tool</Label>
                <select
                  id="tool-select"
                  className="w-full px-3 py-2 border rounded-md"
                  value={selectedTool?.id || ""}
                  onChange={(e) => {
                    const tool = tools.find(t => t.id === e.target.value);
                    setSelectedTool(tool || null);
                    setToolParams("");
                    setToolResult("");
                  }}
                >
                  <option value="">Select a tool...</option>
                  {tools.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTool && (
                <>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">{selectedTool.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedTool.description}
                    </p>
                    <div className="text-sm">
                      <strong>Parameters:</strong>
                      <pre className="mt-1 text-xs">
                        {JSON.stringify(selectedTool.parameters, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tool-params">Parameters (JSON)</Label>
                    <Textarea
                      id="tool-params"
                      placeholder='{"param1": "value1", "param2": "value2"}'
                      value={toolParams}
                      onChange={(e) => setToolParams(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={executeTool}
                    disabled={isExecuting}
                    className="w-full"
                  >
                    {isExecuting ? (
                      <>
                        <Play className="h-4 w-4 mr-2 animate-pulse" />
                        Executing Tool...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Tool
                      </>
                    )}
                  </Button>

                  {toolResult && (
                    <div className="space-y-2">
                      <Label>Execution Result</Label>
                      <div className="bg-muted p-3 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">
                          {toolResult}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MCPHubInterface;
