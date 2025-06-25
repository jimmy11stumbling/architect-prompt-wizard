
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowDown, Settings } from "lucide-react";
import { WorkflowDefinition, WorkflowStep } from "@/types/workflow-types";
import { workflowEngine } from "@/services/workflow/workflowEngine";
import { workflowPersistenceService } from "@/services/workflow/workflowPersistenceService";
import { useToast } from "@/hooks/use-toast";

interface WorkflowBuilderProps {
  onWorkflowCreated?: (workflow: WorkflowDefinition) => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onWorkflowCreated }) => {
  const [workflow, setWorkflow] = useState<Partial<WorkflowDefinition>>({
    name: "",
    description: "",
    steps: [],
    variables: [],
    triggers: []
  });
  const [isBuilding, setIsBuilding] = useState(false);
  const { toast } = useToast();

  const stepTypes = [
    { value: "rag-query", label: "RAG Query", description: "Query knowledge database" },
    { value: "a2a-coordinate", label: "A2A Coordination", description: "Coordinate with agents" },
    { value: "mcp-tool", label: "MCP Tool", description: "Execute external tools" },
    { value: "deepseek-reason", label: "DeepSeek Reasoning", description: "AI reasoning and analysis" },
    { value: "http-request", label: "HTTP Request", description: "Make API calls" },
    { value: "data-transform", label: "Data Transform", description: "Process and transform data" },
    { value: "condition", label: "Condition", description: "Conditional logic" },
    { value: "notification", label: "Notification", description: "Send notifications" }
  ];

  const addStep = useCallback(() => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      name: "New Step",
      type: "rag-query",
      description: "",
      config: {},
      dependencies: []
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ) || []
    }));
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== stepId) || []
    }));
  }, []);

  const saveWorkflow = async () => {
    if (!workflow.name || !workflow.steps?.length) {
      toast({
        title: "Validation Error",
        description: "Workflow name and at least one step are required",
        variant: "destructive"
      });
      return;
    }

    setIsBuilding(true);
    try {
      const completeWorkflow: WorkflowDefinition = {
        id: `wf_${Date.now()}`,
        name: workflow.name,
        description: workflow.description || "",
        version: "1.0.0",
        author: "User",
        tags: [],
        steps: workflow.steps,
        variables: workflow.variables || [],
        triggers: workflow.triggers || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active"
      };

      // Save to persistence layer
      await workflowPersistenceService.saveWorkflow(completeWorkflow);
      
      // Register with engine
      workflowEngine.registerWorkflow(completeWorkflow);

      toast({
        title: "Workflow Created",
        description: `Workflow "${completeWorkflow.name}" has been created successfully`
      });

      onWorkflowCreated?.(completeWorkflow);
      
      // Reset form
      setWorkflow({
        name: "",
        description: "",
        steps: [],
        variables: [],
        triggers: []
      });

    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save workflow",
        variant: "destructive"
      });
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Workflow Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={workflow.name || ""}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter workflow name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={workflow.description || ""}
              onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this workflow does"
              rows={2}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Workflow Steps</h3>
            <Button onClick={addStep} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          <div className="space-y-3">
            {workflow.steps?.map((step, index) => (
              <div key={step.id}>
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Step Name</Label>
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(step.id, { name: e.target.value })}
                        placeholder="Step name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Step Type</Label>
                      <Select
                        value={step.type}
                        onValueChange={(value) => updateStep(step.id, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stepTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Actions</Label>
                      <Button
                        onClick={() => removeStep(step.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(step.id, { description: e.target.value })}
                      placeholder="Describe what this step does"
                      rows={2}
                    />
                  </div>
                </Card>
                
                {index < (workflow.steps?.length || 0) - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {(!workflow.steps || workflow.steps.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No steps added yet. Click "Add Step" to get started.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={saveWorkflow}
            disabled={isBuilding || !workflow.name || !workflow.steps?.length}
          >
            {isBuilding ? "Creating..." : "Create Workflow"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowBuilder;
