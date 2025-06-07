
import { MCPResource } from "@/types/ipa-types";
import { realTimeResponseService } from "../../integration/realTimeResponseService";

export class MCPResourceManager {
  private resources: MCPResource[] = [];

  initialize(): MCPResource[] {
    this.resources = [
      {
        uri: "file:///config/app.json",
        name: "Application Configuration",
        description: "Main application configuration file",
        mimeType: "application/json"
      },
      {
        uri: "db://main/users", 
        name: "User Database Table",
        description: "Main user data table with profiles and preferences",
        mimeType: "application/sql"
      },
      {
        uri: "api://weather/current",
        name: "Current Weather Data",
        description: "Real-time weather information from external service",
        mimeType: "application/json"
      }
    ];

    return this.resources;
  }

  async listResources(): Promise<MCPResource[]> {
    return [...this.resources];
  }

  async readResource(uri: string): Promise<any> {
    const resource = this.resources.find(r => r.uri === uri);
    
    if (!resource) {
      throw new Error(`Resource '${uri}' not found`);
    }

    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: `Reading MCP resource: ${resource.name}`,
      data: { uri, resourceName: resource.name }
    });

    // Simulate resource reading
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockContent: Record<string, any> = {
      "file:///config/app.json": { appName: "IPA System", version: "1.0.0", debug: true },
      "db://main/users": [{ id: 1, name: "John Doe", email: "john@example.com" }],
      "api://weather/current": { temperature: 22, condition: "sunny", humidity: 65 }
    };

    const content = mockContent[uri] || `Content of ${resource.name}`;

    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "success",
      message: `MCP resource ${resource.name} read successfully`,
      data: { uri, contentType: typeof content }
    });

    return content;
  }
}
