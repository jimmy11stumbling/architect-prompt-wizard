/**
 * MCP Tool Registry - Manages all available MCP tools
 */

import { db } from "../../db";
import { sql } from "drizzle-orm";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface MCPToolImplementation {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}

export class MCPToolRegistry {
  private tools = new Map<string, MCPToolImplementation>();

  constructor() {
    this.registerDefaultTools();
  }

  /**
   * Register all default MCP tools
   */
  private registerDefaultTools() {
    // Filesystem tools
    this.registerTool({
      name: "list_files",
      description: "List files in a directory with optional pattern matching",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Directory path to list" },
          pattern: { type: "string", description: "Optional file pattern (glob)" }
        },
        required: ["path"]
      },
      handler: async (args) => {
        try {
          // Handle default path or validate provided path
          const targetPath = args.path || './';
          
          // Resolve relative paths safely
          const resolvedPath = path.resolve(targetPath);
          
          // Security check: ensure path is within project bounds
          const projectRoot = process.cwd();
          if (!resolvedPath.startsWith(projectRoot)) {
            throw new Error('Access denied: Path is outside project directory');
          }
          
          const files = await fs.readdir(resolvedPath);
          
          if (args.pattern) {
            // Simple pattern matching
            const regex = new RegExp(args.pattern.replace(/\*/g, '.*'));
            return files.filter(f => regex.test(f));
          }
          
          return files;
        } catch (error) {
          throw new Error(`Failed to list files: ${error}`);
        }
      }
    });

    this.registerTool({
      name: "read_file",
      description: "Read the contents of a file",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path to read" },
          encoding: { type: "string", description: "File encoding (default: utf8)" }
        },
        required: ["path"]
      },
      handler: async (args) => {
        try {
          // Resolve relative paths safely
          const resolvedPath = path.resolve(args.path);
          
          // Security check: ensure path is within project bounds
          const projectRoot = process.cwd();
          if (!resolvedPath.startsWith(projectRoot)) {
            throw new Error('Access denied: Path is outside project directory');
          }
          
          const encoding = (args.encoding && args.encoding !== "File encoding (default: utf8)") ? args.encoding : 'utf8';
          const content = await fs.readFile(resolvedPath, encoding);
          return { 
            content, 
            size: content.length,
            path: resolvedPath,
            encoding: encoding
          };
        } catch (error) {
          throw new Error(`Failed to read file: ${error}`);
        }
      }
    });

    this.registerTool({
      name: "write_file",
      description: "Write content to a file",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path to write" },
          content: { type: "string", description: "Content to write" },
          encoding: { type: "string", description: "File encoding (default: utf8)" }
        },
        required: ["path", "content"]
      },
      handler: async (args) => {
        try {
          // Resolve relative paths safely
          const resolvedPath = path.resolve(args.path);
          
          // Security check: ensure path is within project bounds
          const projectRoot = process.cwd();
          if (!resolvedPath.startsWith(projectRoot)) {
            throw new Error('Access denied: Path is outside project directory');
          }
          
          // Ensure directory exists
          const dir = path.dirname(resolvedPath);
          await fs.mkdir(dir, { recursive: true });
          
          await fs.writeFile(resolvedPath, args.content, args.encoding || 'utf8');
          return { 
            success: true, 
            path: resolvedPath,
            size: args.content.length,
            encoding: args.encoding || 'utf8'
          };
        } catch (error) {
          throw new Error(`Failed to write file: ${error}`);
        }
      }
    });

    // Web search tool (simulated)
    this.registerTool({
      name: "web_search",
      description: "Search the web for information",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          maxResults: { type: "number", description: "Maximum results (default: 10)" }
        },
        required: ["query"]
      },
      handler: async (args) => {
        // In a real implementation, this would call a search API
        const results = [
          {
            title: `Search result for: ${args.query}`,
            url: `https://example.com/search?q=${encodeURIComponent(args.query)}`,
            snippet: `This is a simulated search result for "${args.query}". In production, this would connect to a real search API.`
          }
        ];
        return { query: args.query, results, count: results.length };
      }
    });

    // Database query tool
    this.registerTool({
      name: "query_database",
      description: "Execute a read-only database query",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "SQL query (SELECT only)" },
          params: { type: "array", description: "Query parameters" }
        },
        required: ["query"]
      },
      handler: async (args) => {
        try {
          // Only allow SELECT queries for safety
          if (!args.query.trim().toUpperCase().startsWith('SELECT')) {
            throw new Error("Only SELECT queries are allowed");
          }
          
          const result = await db.execute(sql.raw(args.query));
          return {
            rows: result.rows,
            rowCount: result.rows.length
          };
        } catch (error) {
          throw new Error(`Database query failed: ${error}`);
        }
      }
    });

    // Code analysis tool
    this.registerTool({
      name: "analyze_code",
      description: "Analyze code for complexity, style issues, and potential bugs",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "Code to analyze" },
          language: { type: "string", description: "Programming language (js, ts, python, etc.)" }
        },
        required: ["code"]
      },
      handler: async (args) => {
        // Simple code analysis
        const lines = args.code.split('\n');
        const analysis = {
          lineCount: lines.length,
          language: args.language || 'unknown',
          complexity: this.calculateComplexity(args.code),
          issues: this.findCommonIssues(args.code, args.language)
        };
        return analysis;
      }
    });

    // Shell command tool (restricted)
    this.registerTool({
      name: "run_command",
      description: "Run a shell command (restricted to safe commands)",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "Command to run" },
          args: { type: "array", description: "Command arguments" }
        },
        required: ["command"]
      },
      handler: async (args) => {
        // Whitelist of safe commands
        const safeCommands = ['ls', 'pwd', 'echo', 'date', 'whoami'];
        if (!safeCommands.includes(args.command)) {
          throw new Error(`Command '${args.command}' is not allowed`);
        }
        
        try {
          const fullCommand = args.args ? `${args.command} ${args.args.join(' ')}` : args.command;
          const { stdout, stderr } = await execAsync(fullCommand);
          return { stdout, stderr, command: fullCommand };
        } catch (error) {
          throw new Error(`Command execution failed: ${error}`);
        }
      }
    });

    // Document processing tool
    this.registerTool({
      name: "process_document",
      description: "Process and extract information from documents",
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "Document content" },
          operation: { 
            type: "string", 
            description: "Operation to perform (summarize, extract_keywords, sentiment)",
            enum: ["summarize", "extract_keywords", "sentiment"]
          }
        },
        required: ["content", "operation"]
      },
      handler: async (args) => {
        switch (args.operation) {
          case "summarize":
            // Simple summarization (first 100 words)
            const words = args.content.split(/\s+/);
            return {
              summary: words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : ''),
              wordCount: words.length
            };
          
          case "extract_keywords":
            // Simple keyword extraction
            const keywords = this.extractKeywords(args.content);
            return { keywords };
          
          case "sentiment":
            // Simple sentiment analysis
            const sentiment = this.analyzeSentiment(args.content);
            return { sentiment };
          
          default:
            throw new Error(`Unknown operation: ${args.operation}`);
        }
      }
    });
  }

  /**
   * Register a new tool
   */
  registerTool(tool: MCPToolImplementation) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): MCPToolImplementation[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get a specific tool
   */
  getTool(name: string): MCPToolImplementation | undefined {
    return this.tools.get(name);
  }

  /**
   * Execute a tool
   */
  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      return await tool.handler(args);
    } catch (error) {
      throw new Error(`Tool execution failed: ${error}`);
    }
  }

  // Helper methods
  private calculateComplexity(code: string): string {
    const loops = (code.match(/\b(for|while|do)\b/g) || []).length;
    const conditions = (code.match(/\b(if|else|switch|case)\b/g) || []).length;
    const functions = (code.match(/\b(function|=>|def|fn)\b/g) || []).length;
    
    const score = loops * 3 + conditions * 2 + functions;
    
    if (score < 10) return "low";
    if (score < 20) return "medium";
    return "high";
  }

  private findCommonIssues(code: string, language?: string): string[] {
    const issues: string[] = [];
    
    // Check for console.log in production code
    if (code.includes('console.log')) {
      issues.push("Contains console.log statements");
    }
    
    // Check for TODO comments
    if (code.match(/\/\/\s*TODO|#\s*TODO/)) {
      issues.push("Contains TODO comments");
    }
    
    // Check for very long lines
    const lines = code.split('\n');
    const longLines = lines.filter(line => line.length > 120);
    if (longLines.length > 0) {
      issues.push(`${longLines.length} lines exceed 120 characters`);
    }
    
    return issues;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\W+/);
    const wordFreq = new Map<string, number>();
    
    // Count word frequency
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
    
    // Sort by frequency and return top 10
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private analyzeSentiment(text: string): string {
    const positive = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like'];
    const negative = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'poor', 'worst'];
    
    const words = text.toLowerCase().split(/\W+/);
    let score = 0;
    
    words.forEach(word => {
      if (positive.includes(word)) score++;
      if (negative.includes(word)) score--;
    });
    
    if (score > 2) return "positive";
    if (score < -2) return "negative";
    return "neutral";
  }
}

// Global tool registry instance
export const mcpToolRegistry = new MCPToolRegistry();