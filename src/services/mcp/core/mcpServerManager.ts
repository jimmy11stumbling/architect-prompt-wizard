
import { MCPServer } from "@/types/ipa-types";

export class MCPServerManager {
  private servers: MCPServer[] = [];

  initialize(): MCPServer[] {
    this.servers = [
      {
        id: "filesystem-server",
        name: "Filesystem Server",
        status: "online",
        endpoint: "stdio://mcp-filesystem",
        toolCount: 5,
        resourceCount: 10,
        capabilities: ["file-operations", "directory-listing", "file-search"]
      },
      {
        id: "web-search-server", 
        name: "Web Search Server",
        status: "online",
        endpoint: "https://api.websearch.mcp/v1",
        toolCount: 3,
        resourceCount: 0,
        capabilities: ["web-search", "content-extraction", "url-analysis"]
      },
      {
        id: "database-server",
        name: "Database Server", 
        status: "online",
        endpoint: "stdio://mcp-database",
        toolCount: 8,
        resourceCount: 25,
        capabilities: ["sql-query", "schema-inspection", "data-export"]
      },
      {
        id: "documentation-server",
        name: "Documentation Server",
        status: "online", 
        endpoint: "stdio://mcp-docs",
        toolCount: 4,
        resourceCount: 50,
        capabilities: ["doc-generation", "api-reference", "markdown-processing"]
      }
    ];

    return this.servers;
  }

  getServers(): MCPServer[] {
    return [...this.servers];
  }

  async healthCheck(): Promise<boolean> {
    const onlineServers = this.servers.filter(s => s.status === "online").length;
    return onlineServers > 0;
  }
}
