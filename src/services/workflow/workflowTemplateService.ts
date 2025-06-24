
import { WorkflowTemplate, WorkflowDefinition } from "@/types/workflow-types";

export class WorkflowTemplateService {
  private static instance: WorkflowTemplateService;
  private templates: WorkflowTemplate[] = [];

  static getInstance(): WorkflowTemplateService {
    if (!WorkflowTemplateService.instance) {
      WorkflowTemplateService.instance = new WorkflowTemplateService();
      WorkflowTemplateService.instance.initializeTemplates();
    }
    return WorkflowTemplateService.instance;
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        id: "rag-analysis",
        name: "RAG Document Analysis",
        description: "Retrieve documents from RAG database and analyze with DeepSeek",
        category: "AI Analysis",
        difficulty: "beginner",
        tags: ["rag", "analysis", "deepseek"],
        preview: "Query RAG → Analyze with AI → Generate Report",
        definition: {
          name: "RAG Document Analysis",
          description: "Automated document analysis using RAG and AI reasoning",
          steps: [
            {
              id: "rag-query",
              name: "Query RAG Database",
              type: "rag-query",
              description: "Retrieve relevant documents",
              config: {
                query: "${query}",
                limit: 10,
                threshold: 0.4
              },
              dependencies: []
            },
            {
              id: "analyze-docs",
              name: "Analyze Documents",
              type: "deepseek-reason",
              description: "Analyze retrieved documents with AI",
              config: {
                prompt: "Analyze the following documents and provide key insights: ${rag-query.documents}",
                maxTokens: 2048,
                ragEnabled: true
              },
              dependencies: ["rag-query"]
            }
          ],
          variables: [
            {
              name: "query",
              type: "string",
              value: "",
              description: "Search query for documents",
              required: true
            }
          ],
          triggers: [
            {
              type: "manual",
              config: {}
            }
          ]
        }
      },
      {
        id: "multi-agent-coordination",
        name: "Multi-Agent Task Coordination",
        description: "Coordinate multiple AI agents for complex task execution",
        category: "Agent Coordination",
        difficulty: "intermediate",
        tags: ["a2a", "coordination", "agents"],
        preview: "Delegate Task → Coordinate Agents → Combine Results",
        definition: {
          name: "Multi-Agent Task Coordination",
          description: "Coordinate multiple agents for complex task execution",
          steps: [
            {
              id: "delegate-task",
              name: "Delegate Task",
              type: "a2a-coordinate",
              description: "Delegate task to appropriate agent",
              config: {
                task: "${task_description}",
                capabilities: ["${required_capabilities}"]
              },
              dependencies: []
            },
            {
              id: "monitor-progress",
              name: "Monitor Progress",
              type: "condition",
              description: "Check if task is completed",
              config: {
                condition: {
                  field: "delegate-task.status",
                  operator: "equals",
                  value: "completed"
                }
              },
              dependencies: ["delegate-task"]
            },
            {
              id: "process-results",
              name: "Process Results",
              type: "deepseek-reason",
              description: "Process and analyze agent results",
              config: {
                prompt: "Process the following agent results: ${delegate-task.result}",
                maxTokens: 1024,
                a2aEnabled: true
              },
              dependencies: ["monitor-progress"]
            }
          ],
          variables: [
            {
              name: "task_description",
              type: "string",
              value: "",
              description: "Description of the task to delegate",
              required: true
            },
            {
              name: "required_capabilities",
              type: "array",
              value: [],
              description: "Required agent capabilities",
              required: false
            }
          ],
          triggers: [
            {
              type: "manual",
              config: {}
            }
          ]
        }
      },
      {
        id: "data-pipeline",
        name: "Data Processing Pipeline",
        description: "Extract, transform, and load data with validation",
        category: "Data Processing",
        difficulty: "advanced",
        tags: ["etl", "data", "pipeline"],
        preview: "Extract Data → Transform → Validate → Load",
        definition: {
          name: "Data Processing Pipeline",
          description: "Comprehensive data processing workflow",
          steps: [
            {
              id: "extract-data",
              name: "Extract Data",
              type: "http-request",
              description: "Extract data from source API",
              config: {
                url: "${source_url}",
                method: "GET",
                headers: {
                  "Authorization": "Bearer ${api_token}"
                },
                parseResponse: true
              },
              dependencies: []
            },
            {
              id: "transform-data",
              name: "Transform Data",
              type: "data-transform",
              description: "Transform extracted data",
              config: {
                sourceStepId: "extract-data",
                operation: "map",
                mapping: {
                  "id": "id",
                  "name": "title",
                  "value": "amount"
                }
              },
              dependencies: ["extract-data"]
            },
            {
              id: "validate-data",
              name: "Validate Data",
              type: "condition",
              description: "Validate transformed data",
              config: {
                condition: {
                  field: "transform-data",
                  operator: "exists",
                  value: true
                }
              },
              dependencies: ["transform-data"]
            },
            {
              id: "load-data",
              name: "Load Data",
              type: "http-request",
              description: "Load data to destination",
              config: {
                url: "${destination_url}",
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: "${transform-data}"
              },
              dependencies: ["validate-data"]
            }
          ],
          variables: [
            {
              name: "source_url",
              type: "string",
              value: "",
              description: "Source API URL",
              required: true
            },
            {
              name: "destination_url",
              type: "string",
              value: "",
              description: "Destination API URL",
              required: true
            },
            {
              name: "api_token",
              type: "string",
              value: "",
              description: "API authentication token",
              required: true
            }
          ],
          triggers: [
            {
              type: "schedule",
              config: {
                cron: "0 */6 * * *"
              }
            }
          ]
        }
      }
    ];
  }

  getAllTemplates(): WorkflowTemplate[] {
    return this.templates;
  }

  getTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  getTemplatesByDifficulty(difficulty: string): WorkflowTemplate[] {
    return this.templates.filter(t => t.difficulty === difficulty);
  }

  createWorkflowFromTemplate(templateId: string, customizations: Partial<WorkflowDefinition>): WorkflowDefinition {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const workflow: WorkflowDefinition = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customizations.name || template.definition.name || template.name,
      description: customizations.description || template.definition.description || template.description,
      version: "1.0.0",
      author: "User",
      tags: customizations.tags || template.tags,
      steps: customizations.steps || template.definition.steps || [],
      variables: customizations.variables || template.definition.variables || [],
      triggers: customizations.triggers || template.definition.triggers || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "draft"
    };

    return workflow;
  }
}

export const workflowTemplateService = WorkflowTemplateService.getInstance();
