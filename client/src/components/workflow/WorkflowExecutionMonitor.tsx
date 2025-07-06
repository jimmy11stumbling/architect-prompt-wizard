import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Activity
} from "lucide-react";
import { workflowEngine } from "@/services/workflow/workflowEngine";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";
import { WorkflowExecution, WorkflowStepExecution } from "@/types/workflow-types";
import { useToast } from "@/hooks/use-toast";

interface WorkflowExecutionMonitorProps {
  executionId?: string;
  showAllExecutions?: boolean;
}

const WorkflowExecutionMonitor: React.FC<WorkflowExecutionMonitorProps> = ({ 
  executionId, 
  showAllExecutions = false 
}) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadExecutions();
    
    // Subscribe to real-time updates
    const unsubscribe = realTimeResponseService.subscribe((response) => {
      if (response.source === "workflow-engine") {
        setLogs(prev => [...prev.slice(-99), response]); // Keep last 100 logs
        loadExecutions(); // Refresh execution data
      }
    });

    const interval = setInterval(loadExecutions, 2000); // Refresh every 2 seconds
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [executionId, showAllExecutions]);

  const loadExecutions = () => {
    if (executionId) {
      const execution = workflowEngine.getExecution(executionId);
      if (execution) {
        setExecutions([execution]);
        setSelectedExecution(execution);
      }
    } else if (showAllExecutions) {
      const allExecutions = workflowEngine.getAllExecutions();
      setExecutions(allExecutions);
      if (!selectedExecution && allExecutions.length > 0) {
        setSelectedExecution(allExecutions[0]);
      }
    }
  };

  const handleExecutionControl = async (action: string, execId: string) => {
    try {
      switch (action) {
        case "pause":
          await workflowEngine.pauseExecution(execId);
          toast({ title: "Execution paused", description: `Workflow execution ${execId} has been paused` });
          break;
        case "resume":
          await workflowEngine.resumeExecution(execId);
          toast({ title: "Execution resumed", description: `Workflow execution ${execId} has been resumed` });
          break;
        case "cancel":
          await workflowEngine.cancelExecution(execId);
          toast({ title: "Execution cancelled", description: `Workflow execution ${execId} has been cancelled` });
          break;
      }
      loadExecutions();
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "running": return "secondary";
      case "paused": return "outline";
      case "failed": return "destructive";
      case "cancelled": return "outline";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running": return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "paused": return <Pause className="h-4 w-4 text-yellow-500" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "cancelled": return <Square className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const calculateProgress = (execution: WorkflowExecution): number => {
    if (execution.metrics.totalSteps === 0) return 0;
    return (execution.metrics.completedSteps / execution.metrics.totalSteps) * 100;
  };

  const formatDuration = (startTime: number, endTime?: number): string => {
    const duration = (endTime || Date.now()) - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Execution List */}
      {showAllExecutions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedExecution?.id === execution.id ? 'bg-accent' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedExecution(execution)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <span className="font-medium">{execution.workflowId}</span>
                      <Badge variant={getStatusColor(execution.status)}>
                        {execution.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(execution.startedAt, execution.completedAt)}
                    </span>
                  </div>
                  <Progress value={calculateProgress(execution)} className="mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Execution Details */}
      {selectedExecution && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(selectedExecution.status)}
                Execution: {selectedExecution.id}
              </CardTitle>
              <div className="flex gap-2">
                {selectedExecution.status === "running" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecutionControl("pause", selectedExecution.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleExecutionControl("cancel", selectedExecution.id)}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {selectedExecution.status === "paused" && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleExecutionControl("resume", selectedExecution.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Execution Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-blue-500">
                  {selectedExecution.metrics.completedSteps}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-red-500">
                  {selectedExecution.metrics.failedSteps}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-yellow-500">
                  {selectedExecution.metrics.skippedSteps}
                </div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">
                  {selectedExecution.metrics.totalSteps}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(calculateProgress(selectedExecution))}%</span>
              </div>
              <Progress value={calculateProgress(selectedExecution)} />
            </div>

            {/* Step Details */}
            <div className="space-y-2">
              <h4 className="font-semibold">Step Status</h4>
              <ScrollArea className="h-64 border rounded p-3">
                {selectedExecution.steps.map((step, index) => (
                  <div key={step.stepId} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      <span className="font-medium">Step {index + 1}</span>
                      <Badge variant={getStatusColor(step.status)} size="sm">
                        {step.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {step.duration ? `${step.duration}ms` : '-'}
                      {step.retryCount > 0 && (
                        <span className="ml-2 text-yellow-500">
                          <RotateCcw className="h-3 w-3 inline" /> {step.retryCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 border rounded p-3">
            {logs.slice(-20).map((log, index) => (
              <div key={index} className="flex items-start gap-2 py-1 text-sm">
                <span className="text-muted-foreground">
                  {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                </span>
                <Badge 
                  variant={log.status === 'error' ? 'destructive' : 
                          log.status === 'warning' ? 'outline' : 'default'}
                  size="sm"
                >
                  {log.status}
                </Badge>
                <span>{log.message}</span>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowExecutionMonitor;