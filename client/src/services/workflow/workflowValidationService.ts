import { WorkflowDefinition, WorkflowStep } from "@/types/workflow-types";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  id: string;
  type: "structure" | "dependency" | "configuration" | "security" | "performance";
  severity: "error" | "warning" | "info";
  message: string;
  stepId?: string;
  field?: string;
  fix?: string;
}

export interface ValidationWarning {
  id: string;
  message: string;
  stepId?: string;
  recommendation?: string;
}

export interface ValidationSuggestion {
  id: string;
  message: string;
  stepId?: string;
  improvement?: string;
}

export class WorkflowValidationService {
  private static instance: WorkflowValidationService;

  static getInstance(): WorkflowValidationService {
    if (!WorkflowValidationService.instance) {
      WorkflowValidationService.instance = new WorkflowValidationService();
    }
    return WorkflowValidationService.instance;
  }

  validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Basic structure validation
    this.validateBasicStructure(workflow, errors);
    
    // Step validation
    this.validateSteps(workflow, errors, warnings);
    
    // Dependency validation
    this.validateDependencies(workflow, errors, warnings);
    
    // Configuration validation
    this.validateStepConfigurations(workflow, errors, warnings);
    
    // Performance suggestions
    this.generatePerformanceSuggestions(workflow, suggestions);
    
    // Security validation
    this.validateSecurity(workflow, errors, warnings);

    return {
      isValid: errors.filter(e => e.severity === "error").length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private validateBasicStructure(workflow: WorkflowDefinition, errors: ValidationError[]) {
    if (!workflow.name || workflow.name.trim() === "") {
      errors.push({
        id: "missing_name",
        type: "structure",
        severity: "error",
        message: "Workflow name is required",
        field: "name",
        fix: "Provide a meaningful name for the workflow"
      });
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push({
        id: "no_steps",
        type: "structure",
        severity: "error",
        message: "Workflow must contain at least one step",
        field: "steps",
        fix: "Add workflow steps"
      });
    }

    if (workflow.name && workflow.name.length > 100) {
      errors.push({
        id: "name_too_long",
        type: "structure",
        severity: "warning",
        message: "Workflow name is very long and may be truncated",
        field: "name",
        fix: "Consider shortening the workflow name"
      });
    }

    // Check for duplicate step IDs
    if (workflow.steps) {
      const stepIds = workflow.steps.map(s => s.id);
      const duplicates = stepIds.filter((id, index) => stepIds.indexOf(id) !== index);
      
      if (duplicates.length > 0) {
        errors.push({
          id: "duplicate_step_ids",
          type: "structure",
          severity: "error",
          message: `Duplicate step IDs found: ${duplicates.join(", ")}`,
          fix: "Ensure all step IDs are unique"
        });
      }
    }
  }

  private validateSteps(workflow: WorkflowDefinition, errors: ValidationError[], warnings: ValidationWarning[]) {
    if (!workflow.steps) return;

    workflow.steps.forEach((step, index) => {
      // Validate step structure
      if (!step.id || step.id.trim() === "") {
        errors.push({
          id: `step_${index}_missing_id`,
          type: "structure",
          severity: "error",
          message: `Step ${index + 1} is missing an ID`,
          stepId: step.id,
          fix: "Provide a unique ID for the step"
        });
      }

      if (!step.name || step.name.trim() === "") {
        errors.push({
          id: `step_${index}_missing_name`,
          type: "structure",
          severity: "error",
          message: `Step ${index + 1} is missing a name`,
          stepId: step.id,
          fix: "Provide a descriptive name for the step"
        });
      }

      if (!step.type) {
        errors.push({
          id: `step_${index}_missing_type`,
          type: "structure",
          severity: "error",
          message: `Step ${index + 1} is missing a type`,
          stepId: step.id,
          fix: "Specify the step type (e.g., 'action', 'condition', 'loop')"
        });
      }

      // Validate step types
      const validTypes = [
        "rag-query", "a2a-coordinate", "mcp-tool", "deepseek-reason",
        "http-request", "data-transform", "condition", "notification",
        "delay", "parallel", "loop"
      ];

      if (step.type && !validTypes.includes(step.type)) {
        errors.push({
          id: `step_${index}_invalid_type`,
          type: "configuration",
          severity: "error",
          message: `Step ${step.name} has invalid type: ${step.type}`,
          stepId: step.id,
          fix: `Use one of: ${validTypes.join(", ")}`
        });
      }

      // Validate step-specific configurations
      this.validateStepTypeConfiguration(step, errors, warnings);
    });
  }

  private validateStepTypeConfiguration(step: WorkflowStep, errors: ValidationError[], warnings: ValidationWarning[]) {
    const config = step.config || {};

    switch (step.type) {
      case "rag-query":
        if (!config.query) {
          errors.push({
            id: `${step.id}_missing_query`,
            type: "configuration",
            severity: "error",
            message: `RAG query step "${step.name}" is missing query parameter`,
            stepId: step.id,
            fix: "Add a query parameter to the step configuration"
          });
        }
        break;

      case "http-request":
        if (!config.url) {
          errors.push({
            id: `${step.id}_missing_url`,
            type: "configuration",
            severity: "error",
            message: `HTTP request step "${step.name}" is missing URL parameter`,
            stepId: step.id,
            fix: "Add a URL parameter to the step configuration"
          });
        }
        
        if (config.url && !this.isValidUrl(config.url)) {
          errors.push({
            id: `${step.id}_invalid_url`,
            type: "configuration",
            severity: "error",
            message: `HTTP request step "${step.name}" has invalid URL`,
            stepId: step.id,
            fix: "Provide a valid HTTP/HTTPS URL"
          });
        }
        break;

      case "mcp-tool":
        if (!config.toolName) {
          errors.push({
            id: `${step.id}_missing_tool_name`,
            type: "configuration",
            severity: "error",
            message: `MCP tool step "${step.name}" is missing toolName parameter`,
            stepId: step.id,
            fix: "Specify the MCP tool name to execute"
          });
        }
        break;

      case "deepseek-reason":
        if (!config.prompt) {
          errors.push({
            id: `${step.id}_missing_prompt`,
            type: "configuration",
            severity: "error",
            message: `DeepSeek reasoning step "${step.name}" is missing prompt parameter`,
            stepId: step.id,
            fix: "Add a prompt parameter for the reasoning task"
          });
        }
        break;

      case "condition":
        if (!config.condition) {
          errors.push({
            id: `${step.id}_missing_condition`,
            type: "configuration",
            severity: "error",
            message: `Condition step "${step.name}" is missing condition parameter`,
            stepId: step.id,
            fix: "Define the condition to evaluate"
          });
        }
        break;

      case "loop":
        if (!config.dataSource && !config.staticData) {
          warnings.push({
            id: `${step.id}_missing_loop_data`,
            message: `Loop step "${step.name}" should specify dataSource or staticData`,
            stepId: step.id,
            recommendation: "Add dataSource or staticData for the loop iteration"
          });
        }
        break;
    }
  }

  private validateDependencies(workflow: WorkflowDefinition, errors: ValidationError[], warnings: ValidationWarning[]) {
    if (!workflow.steps) return;

    const stepIds = new Set(workflow.steps.map(s => s.id));

    workflow.steps.forEach(step => {
      if (step.dependencies) {
        step.dependencies.forEach(depId => {
          if (!stepIds.has(depId)) {
            errors.push({
              id: `${step.id}_invalid_dependency`,
              type: "dependency",
              severity: "error",
              message: `Step "${step.name}" depends on non-existent step: ${depId}`,
              stepId: step.id,
              fix: "Remove invalid dependency or add the missing step"
            });
          }
        });
      }

      // Check for circular dependencies
      if (this.hasCircularDependency(step, workflow.steps)) {
        errors.push({
          id: `${step.id}_circular_dependency`,
          type: "dependency",
          severity: "error",
          message: `Step "${step.name}" has circular dependency`,
          stepId: step.id,
          fix: "Remove circular dependencies in the workflow"
        });
      }
    });
  }

  private validateStepConfigurations(workflow: WorkflowDefinition, errors: ValidationError[], warnings: ValidationWarning[]) {
    if (!workflow.steps) return;

    workflow.steps.forEach(step => {
      const config = step.config || {};

      // Check for variable references
      Object.entries(config).forEach(([key, value]) => {
        if (typeof value === "string" && value.includes("${")) {
          const variables = this.extractVariables(value);
          variables.forEach(varName => {
            const hasVariable = workflow.variables?.some(v => v.name === varName);
            const isStepReference = workflow.steps?.some(s => value.includes(`\${${s.id}.`));
            
            if (!hasVariable && !isStepReference) {
              warnings.push({
                id: `${step.id}_undefined_variable`,
                message: `Step "${step.name}" references undefined variable: ${varName}`,
                stepId: step.id,
                recommendation: "Define the variable in workflow variables or verify step reference"
              });
            }
          });
        }
      });
    });
  }

  private validateSecurity(workflow: WorkflowDefinition, errors: ValidationError[], warnings: ValidationWarning[]) {
    if (!workflow.steps) return;

    workflow.steps.forEach(step => {
      const config = step.config || {};

      // Check for potential security issues
      if (step.type === "http-request") {
        if (config.url && config.url.startsWith("http://")) {
          warnings.push({
            id: `${step.id}_insecure_http`,
            message: `Step "${step.name}" uses insecure HTTP protocol`,
            stepId: step.id,
            recommendation: "Consider using HTTPS for security"
          });
        }

        // Check for sensitive data in headers
        if (config.headers) {
          Object.keys(config.headers).forEach(header => {
            if (header.toLowerCase().includes("authorization") || header.toLowerCase().includes("api")) {
              if (typeof config.headers[header] === "string" && !config.headers[header].includes("${")) {
                warnings.push({
                  id: `${step.id}_hardcoded_auth`,
                  message: `Step "${step.name}" may contain hardcoded authentication`,
                  stepId: step.id,
                  recommendation: "Use variables for sensitive authentication data"
                });
              }
            }
          });
        }
      }
    });
  }

  private generatePerformanceSuggestions(workflow: WorkflowDefinition, suggestions: ValidationSuggestion[]) {
    if (!workflow.steps) return;

    // Check for parallelization opportunities
    const independentSteps = workflow.steps.filter(step => 
      !step.dependencies || step.dependencies.length === 0
    );

    if (independentSteps.length > 1) {
      suggestions.push({
        id: "parallelization_opportunity",
        message: `${independentSteps.length} independent steps could be run in parallel`,
        improvement: "Consider grouping independent steps in a parallel step for better performance"
      });
    }

    // Check for long-running operations
    const potentiallySlowSteps = workflow.steps.filter(step => 
      step.type === "http-request" || step.type === "deepseek-reason" || step.type === "rag-query"
    );

    if (potentiallySlowSteps.length > 3) {
      suggestions.push({
        id: "timeout_configuration",
        message: "Multiple potentially slow operations detected",
        improvement: "Consider adding timeout configurations and retry policies"
      });
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  }

  private hasCircularDependency(step: WorkflowStep, allSteps: WorkflowStep[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (currentStepId: string): boolean => {
      if (recursionStack.has(currentStepId)) return true;
      if (visited.has(currentStepId)) return false;

      visited.add(currentStepId);
      recursionStack.add(currentStepId);

      const currentStep = allSteps.find(s => s.id === currentStepId);
      if (currentStep?.dependencies) {
        for (const depId of currentStep.dependencies) {
          if (hasCycle(depId)) return true;
        }
      }

      recursionStack.delete(currentStepId);
      return false;
    };

    return hasCycle(step.id);
  }

  private extractVariables(text: string): string[] {
    const matches = text.match(/\$\{([^}]+)\}/g) || [];
    return matches.map(match => match.slice(2, -1).split(".")[0]);
  }
}

export const workflowValidationService = WorkflowValidationService.getInstance();