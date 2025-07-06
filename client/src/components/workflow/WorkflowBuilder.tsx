import React, { useState, useCallback } from "react";
import { Plus, Play, Save, Trash2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { workflowValidationService } from "@/services/workflow/workflowValidationService";

interface WorkflowStep {
  id: string;
  name: string;
  type: "action" | "condition" | "loop" | "parallel";
  description: string;
  config: Record<string, any>;
  next?: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  status: "draft" | "active" | "inactive";
}

const WorkflowBuilder: React.FC<{ onWorkflowCreated?: (workflow: any) => void }> = ({ onWorkflowCreated }) => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: crypto.randomUUID(),
    name: "",
    description: "",
    steps: [],
    triggers: [],
    status: "draft"
  });
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const addStep = (type: WorkflowStep["type"]) => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `New ${type} step`,
      type,
      description: "",
      config: {}
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    setSelectedStep(newStep);
    setIsEditing(true);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));

    if (selectedStep?.id === stepId) {
      setSelectedStep(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));

    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
      setIsEditing(false);
    }
  };

  const saveWorkflow = async () => {
    // Validate workflow before saving
    const validation = workflowValidationService.validateWorkflow(workflow);
    
    if (!validation.isValid) {
      const errorMessages = validation.errors
        .filter(e => e.severity === "error")
        .map(e => e.message)
        .slice(0, 3)
        .join(", ");
      
      toast({
        title: "Validation Failed",
        description: errorMessages,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow)
      });

      if (response.ok) {
        toast({
          title: "Workflow Saved",
          description: "Your workflow has been saved successfully"
        });
      } else {
        throw new Error("Failed to save workflow");
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const executeWorkflow = async () => {
    // Validate workflow before execution
    const validation = workflowValidationService.validateWorkflow(workflow);
    
    if (!validation.isValid) {
      const errorMessages = validation.errors
        .filter(e => e.severity === "error")
        .map(e => e.message)
        .slice(0, 3)
        .join(", ");
      
      toast({
        title: "Cannot Execute",
        description: `Validation failed: ${errorMessages}`,
        variant: "destructive"
      });
      return;
    }

    if (validation.warnings.length > 0) {
      const warningMessages = validation.warnings
        .slice(0, 2)
        .map(w => w.message)
        .join(", ");
      
      toast({
        title: "Validation Warnings",
        description: `${warningMessages}${validation.warnings.length > 2 ? ` and ${validation.warnings.length - 2} more...` : ""}`,
        variant: "default"
      });
    }

    try {
      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immediate: true })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Workflow Executed",
          description: `Execution ID: ${result.executionId}`
        });
      } else {
        throw new Error("Failed to execute workflow");
      }
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Workflow Canvas */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Canvas</CardTitle>
            <CardDescription>
              Design your workflow by adding and connecting steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Workflow Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Workflow Name</Label>
                  <Input
                    value={workflow.name}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={workflow.status} 
                    onValueChange={(value: Workflow["status"]) => 
                      setWorkflow(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={workflow.description}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your workflow"
                  rows={2}
                />
              </div>

              {/* Step Types */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addStep("action")}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Action
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addStep("condition")}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Condition
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addStep("loop")}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Loop
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addStep("parallel")}
                  className="flex items-center gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  Parallel
                </Button>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-2">
                {workflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedStep?.id === step.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedStep(step);
                      setIsEditing(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={step.type === "action" ? "default" : "secondary"}>
                          {step.type}
                        </Badge>
                        <span className="font-medium">{step.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteStep(step.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={saveWorkflow}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Workflow
                </Button>
                <Button 
                  onClick={executeWorkflow}
                  variant="secondary"
                  className="flex items-center gap-2"
                  disabled={workflow.steps.length === 0}
                >
                  <Play className="h-4 w-4" />
                  Execute
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Editor */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Step Editor</CardTitle>
            <CardDescription>
              {selectedStep ? `Editing: ${selectedStep.name}` : "Select a step to edit"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStep && isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Step Name</Label>
                  <Input
                    value={selectedStep.name}
                    onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={selectedStep.description}
                    onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                    rows={3}
                  />
                </div>

                {selectedStep.type === "action" && (
                  <div>
                    <Label>Action Type</Label>
                    <Select
                      value={selectedStep.config.actionType || ""}
                      onValueChange={(value) => 
                        updateStep(selectedStep.id, { 
                          config: { ...selectedStep.config, actionType: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api_call">API Call</SelectItem>
                        <SelectItem value="data_transform">Data Transform</SelectItem>
                        <SelectItem value="notification">Send Notification</SelectItem>
                        <SelectItem value="wait">Wait/Delay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedStep.type === "condition" && (
                  <div>
                    <Label>Condition Expression</Label>
                    <Textarea
                      value={selectedStep.config.expression || ""}
                      onChange={(e) => 
                        updateStep(selectedStep.id, { 
                          config: { ...selectedStep.config, expression: e.target.value }
                        })
                      }
                      placeholder="e.g., data.value > 100"
                      rows={2}
                    />
                  </div>
                )}

                {selectedStep.type === "loop" && (
                  <div>
                    <Label>Loop Count</Label>
                    <Input
                      type="number"
                      value={selectedStep.config.count || ""}
                      onChange={(e) => 
                        updateStep(selectedStep.id, { 
                          config: { ...selectedStep.config, count: parseInt(e.target.value) }
                        })
                      }
                      placeholder="Number of iterations"
                    />
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="w-full"
                >
                  Done Editing
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a step from the canvas to edit its properties
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowBuilder;