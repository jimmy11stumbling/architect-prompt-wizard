
import { WorkflowDefinition, WorkflowTemplate } from "@/types/workflow-types";

export class WorkflowTemplateService {
  private static instance: WorkflowTemplateService;
  private templates: Map<string, WorkflowTemplate> = new Map();

  static getInstance(): WorkflowTemplateService {
    if (!WorkflowTemplateService.instance) {
      WorkflowTemplateService.instance = new WorkflowTemplateService();
      WorkflowTemplateService.instance.initializeTemplates();
    }
    return WorkflowTemplateService.instance;
  }

  private initializeTemplates(): void {
    const defaultTemplates: WorkflowTemplate[] = [
      {
        id: "rag-analysis-template",
        name: "RAG Document Analysis",
        description: "Analyze documents using RAG database queries and AI reasoning",
        category: "Analysis",
        difficulty: "intermediate",
        tags: ["rag", "analysis", "documents"],
        preview: "Query RAG database → AI Analysis → Generate insights",
        definition: {
          name: "RAG Document Analysis",
          description: "Comprehensive document analysis workflow",
          steps: [
            {
              id: "rag-query-step",
              name: "Query RAG Database",
              type: "rag-query",
              description: "Search for relevant documents",
              config: {
                query: "${input.query}",
                limit: 5,
                threshold: 0.3
              },
              dependencies: []
            },
            {
              id: "analysis-step",
              name: "Analyze Results",
              type: "deepseek-reason",
              description: "Analyze retrieved documents",
              config: {
                prompt: "Analyze the following documents: ${rag-query-step.result}",
                maxTokens: 2048
              },
              dependencies: ["rag-query-step"]
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
        id: "system-health-template",
        name: "System Health Check",
        description: "Comprehensive system health monitoring workflow",
        category: "Monitoring",
        difficulty: "beginner",
        tags: ["health", "monitoring", "system"],
        preview: "Check Services → Generate Report → Send Notifications",
        definition: {
          name: "System Health Check",
          description: "Monitor all system components",
          steps: [
            {
              id: "health-check-step",
              name: "Check System Health",
              type: "http-request",
              description: "Query system health endpoints",
              config: {
                url: "/api/health",
                method: "GET"
              },
              dependencies: []
            },
            {
              id: "notification-step",
              name: "Send Health Report",
              type: "notification",
              description: "Send health status notification",
              config: {
                type: "email",
                message: "System health status: ${health-check-step.result.status}"
              },
              dependencies: ["health-check-step"]
            }
          ],
          variables: [],
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

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  getTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.get(id);
  }

  getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.category === category
    );
  }

  createWorkflowFromTemplate(templateId: string, customizations?: Partial<WorkflowDefinition>): WorkflowDefinition | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const workflow: WorkflowDefinition = {
      id: `wf_${Date.now()}`,
      name: customizations?.name || template.definition.name || template.name,
      description: customizations?.description || template.definition.description || template.description,
      version: "1.0.0",
      author: "User",
      tags: customizations?.tags || template.tags,
      steps: template.definition.steps || [],
      variables: template.definition.variables || [],
      triggers: template.definition.triggers || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "draft",
      ...customizations
    };

    return workflow;
  }
}

export const workflowTemplateService = WorkflowTemplateService.getInstance();
