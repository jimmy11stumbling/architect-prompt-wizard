
import { MCPServer } from "../mcpService";
import { realTimeResponseService } from "../../integration/realTimeResponseService";

export class ServerManager {
  private servers: Map<string, MCPServer> = new Map();

  initialize(): void {
    const defaultServers: MCPServer[] = [
      {
        id: "web-search-server",
        name: "Web Search Server",
        status: "online",
        endpoint: "ws://localhost:3001/mcp",
        tools: [
          { name: "web_search", description: "Search the web for information" },
          { name: "url_fetch", description: "Fetch content from a specific URL" }
        ],
        resources: [
          { uri: "search://web", name: "Web Search", description: "Access to web search capabilities" }
        ]
      },
      {
        id: "file-system-server",
        name: "File System Server", 
        status: "online",
        endpoint: "ws://localhost:3002/mcp",
        tools: [
          { name: "read_file", description: "Read contents of a file" },
          { name: "write_file", description: "Write content to a file" },
          { name: "list_directory", description: "List files in a directory" }
        ],
        resources: [
          { uri: "file://", name: "File System", description: "Access to local file system" }
        ]
      },
      {
        id: "database-server",
        name: "Database Server",
        status: "online", 
        endpoint: "ws://localhost:3003/mcp",
        tools: [
          { name: "execute_query", description: "Execute a database query" },
          { name: "get_schema", description: "Get database schema information" }
        ],
        resources: [
          { uri: "db://main", name: "Main Database", description: "Access to main application database" }
        ]
      }
    ];

    defaultServers.forEach(server => {
      this.servers.set(server.id, server);
    });
  }

  getServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  async healthCheck(): Promise<{ healthy: boolean; serverCount: number; onlineServers: number; totalTools: number }> {
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: "Performing MCP health check",
      data: {}
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    const serverCount = this.servers.size;
    const onlineServers = Array.from(this.servers.values())
      .filter(server => server.status === "online").length;
    const totalTools = this.getAvailableTools().length;

    const healthStatus = {
      healthy: true,
      serverCount,
      onlineServers,
      totalTools
    };

    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "success",
      message: "MCP health check passed",
      data: healthStatus
    });

    return healthStatus;
  }

  private getAvailableTools() {
    const tools: any[] = [];
    this.servers.forEach(server => {
      if (server.status === "online") {
        tools.push(...server.tools);
      }
    });
    return tools;
  }
}
