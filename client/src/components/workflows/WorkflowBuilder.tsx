import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Settings, 
  ArrowRight, 
  GitBranch, 
  Timer,
  Database,
  Globe,
  Cpu,
  FileText,
  Zap
} from 'lucide-react';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'data_processing' | 'api_call' | 'condition' | 'loop' | 'parallel' | 'agent_call' | 'transform';
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  metadata: {
    creator: string;
    createdAt: Date;
    version: string;
    tags: string[];
  };
}

interface WorkflowBuilderProps {
  onSave?: (workflow: WorkflowTemplate) => void;
  onExecute?: (workflow: WorkflowTemplate) => void;
  initialWorkflow?: WorkflowTemplate;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  onSave,
  onExecute,
  initialWorkflow
}) => {
  const [workflow, setWorkflow] = useState<WorkflowTemplate>(
    initialWorkflow || {
      id: crypto.randomUUID(),
      name: 'New Workflow',
      description: '',
      category: 'General',
      steps: [],
      metadata: {
        creator: 'current-user',
        createdAt: new Date(),
        version: '1.0.0',
        tags: []
      }
    }
  );
  
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const stepTypes = [
    { id: 'data_processing', name: 'Data Processing', icon: Database, color: 'bg-blue-500' },
    { id: 'api_call', name: 'API Call', icon: Globe, color: 'bg-green-500' },
    { id: 'condition', name: 'Conditional', icon: GitBranch, color: 'bg-yellow-500' },
    { id: 'loop', name: 'Loop', icon: Timer, color: 'bg-purple-500' },
    { id: 'parallel', name: 'Parallel', icon: Cpu, color: 'bg-orange-500' },
    { id: 'agent_call', name: 'Agent Call', icon: Zap, color: 'bg-red-500' },
    { id: 'transform', name: 'Transform', icon: FileText, color: 'bg-indigo-500' }
  ];

  const addStep = useCallback((type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Step`,
      type,
      config: {},
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
      connections: [],
      status: 'pending'
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  }, []);

  const deleteStep = useCallback((stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
    setSelectedStep(null);
  }, []);

  const connectSteps = useCallback((fromId: string, toId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === fromId 
          ? { ...step, connections: [...step.connections, toId] }
          : step
      )
    }));
  }, []);

  const executeWorkflow = useCallback(async () => {
    if (!onExecute) return;
    
    setIsExecuting(true);
    try {
      await onExecute(workflow);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [workflow, onExecute]);

  const saveWorkflow = useCallback(() => {
    if (onSave) {
      onSave(workflow);
    }
  }, [workflow, onSave]);

  const handleStepDragStart = (e: React.DragEvent, step: WorkflowStep) => {
    setDraggedStep(step);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedStep || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateStep(draggedStep.id, { position: { x, y } });
    setDraggedStep(null);
  };

  const renderStepNode = (step: WorkflowStep) => {
    const stepType = stepTypes.find(t => t.id === step.type);
    const Icon = stepType?.icon || FileText;

    return (
      <div
        key={step.id}
        className={`absolute cursor-pointer border-2 rounded-lg p-3 bg-white shadow-md ${
          selectedStep?.id === step.id ? 'border-blue-500' : 'border-gray-200'
        }`}
        style={{ left: step.position.x, top: step.position.y }}
        draggable
        onDragStart={(e) => handleStepDragStart(e, step)}
        onClick={() => setSelectedStep(step)}
      >
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded ${stepType?.color} text-white`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">{step.name}</div>
            <div className="text-xs text-gray-500 capitalize">{step.type.replace('_', ' ')}</div>
          </div>
        </div>
        
        {step.status && (
          <Badge 
            variant={step.status === 'completed' ? 'default' : 
                   step.status === 'failed' ? 'destructive' : 'secondary'}
            className="mt-1"
          >
            {step.status}
          </Badge>
        )}
      </div>
    );
  };

  const renderConnections = () => {
    return workflow.steps.map(fromStep => 
      fromStep.connections.map(toStepId => {
        const toStep = workflow.steps.find(s => s.id === toStepId);
        if (!toStep) return null;

        const x1 = fromStep.position.x + 100;
        const y1 = fromStep.position.y + 40;
        const x2 = toStep.position.x;
        const y2 = toStep.position.y + 40;

        return (
          <svg
            key={`${fromStep.id}-${toStepId}`}
            className="absolute pointer-events-none"
            style={{ left: 0, top: 0, width: '100%', height: '100%' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            <path
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1}, ${x2} ${y2}`}
              stroke="#6b7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        );
      })
    );
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Toolbox */}
      <Card className="w-80 h-full rounded-none border-r">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workflow Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Step Types</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {stepTypes.map(stepType => {
                const Icon = stepType.icon;
                return (
                  <Button
                    key={stepType.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => addStep(stepType.id as WorkflowStep['type'])}
                  >
                    <div className={`p-1 rounded mr-2 ${stepType.color} text-white`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    {stepType.name}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <Separator />
          
          {selectedStep && (
            <div>
              <Label className="text-sm font-medium">Step Configuration</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label htmlFor="step-name">Name</Label>
                  <Input
                    id="step-name"
                    value={selectedStep.name}
                    onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="step-config">Configuration</Label>
                  <Textarea
                    id="step-config"
                    value={JSON.stringify(selectedStep.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        updateStep(selectedStep.id, { config });
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder="Enter JSON configuration..."
                    rows={6}
                  />
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteStep(selectedStep.id)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Step
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <Card className="rounded-none border-b">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  value={workflow.name}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-semibold"
                  placeholder="Workflow Name"
                />
                <Badge variant="outline">{workflow.steps.length} steps</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={saveWorkflow}>
                  Save
                </Button>
                <Button 
                  onClick={executeWorkflow}
                  disabled={isExecuting || workflow.steps.length === 0}
                >
                  {isExecuting ? (
                    <Square className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isExecuting ? 'Running...' : 'Execute'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <div className="flex-1 bg-gray-50">
          <Tabs defaultValue="canvas" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="canvas">Visual Editor</TabsTrigger>
              <TabsTrigger value="json">JSON Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="canvas" className="h-full mt-0">
              <div
                ref={canvasRef}
                className="relative w-full h-full overflow-auto"
                onDrop={handleCanvasDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {workflow.steps.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Start Building Your Workflow
                      </h3>
                      <p className="text-gray-500">
                        Add steps from the toolbox to get started
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {renderConnections()}
                    {workflow.steps.map(renderStepNode)}
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="json" className="h-full mt-0">
              <div className="p-4 h-full">
                <Textarea
                  value={JSON.stringify(workflow, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsedWorkflow = JSON.parse(e.target.value);
                      setWorkflow(parsedWorkflow);
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="h-full font-mono"
                  placeholder="Workflow JSON..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;