
import { WorkflowExecution, WorkflowMetrics } from "@/types/workflow-types";
import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface WorkflowAlert {
  id: string;
  workflowId: string;
  executionId: string;
  type: "error" | "warning" | "timeout" | "resource";
  message: string;
  timestamp: number;
  resolved: boolean;
}

export interface SystemMetrics {
  activeWorkflows: number;
  completedToday: number;
  failedToday: number;
  averageExecutionTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export class WorkflowMonitoringService {
  private static instance: WorkflowMonitoringService;
  private alerts: Map<string, WorkflowAlert> = new Map();
  private metrics: Map<string, WorkflowMetrics> = new Map();

  static getInstance(): WorkflowMonitoringService {
    if (!WorkflowMonitoringService.instance) {
      WorkflowMonitoringService.instance = new WorkflowMonitoringService();
    }
    return WorkflowMonitoringService.instance;
  }

  trackExecution(execution: WorkflowExecution): void {
    this.metrics.set(execution.id, execution.metrics);
    
    // Check for alerts
    this.checkForAlerts(execution);
    
    realTimeResponseService.addResponse({
      source: "workflow-monitoring",
      status: "processing",
      message: `Tracking execution: ${execution.id}`,
      data: {
        executionId: execution.id,
        status: execution.status,
        progress: execution.metrics.completedSteps / execution.metrics.totalSteps * 100
      }
    });
  }

  private checkForAlerts(execution: WorkflowExecution): void {
    // Timeout alert
    if (execution.startedAt && Date.now() - execution.startedAt > 300000) { // 5 minutes
      this.createAlert({
        workflowId: execution.workflowId,
        executionId: execution.id,
        type: "timeout",
        message: "Execution taking longer than expected"
      });
    }

    // Error alert
    if (execution.status === "failed") {
      this.createAlert({
        workflowId: execution.workflowId,
        executionId: execution.id,
        type: "error",
        message: execution.error || "Workflow execution failed"
      });
    }

    // Resource usage alert
    if (execution.metrics.resourceUsage.memory > 0.8) {
      this.createAlert({
        workflowId: execution.workflowId,
        executionId: execution.id,
        type: "resource",
        message: "High memory usage detected"
      });
    }
  }

  private createAlert(alert: Omit<WorkflowAlert, "id" | "timestamp" | "resolved">): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullAlert: WorkflowAlert = {
      id: alertId,
      timestamp: Date.now(),
      resolved: false,
      ...alert
    };

    this.alerts.set(alertId, fullAlert);

    realTimeResponseService.addResponse({
      source: "workflow-monitoring",
      status: "error",
      message: `Alert: ${alert.message}`,
      data: {
        alertId,
        type: alert.type,
        workflowId: alert.workflowId,
        executionId: alert.executionId
      }
    });
  }

  getAlerts(): WorkflowAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      this.alerts.set(alertId, alert);
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const executions = Array.from(this.metrics.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = executions.filter(m => 
      m.totalSteps === m.completedSteps && m.totalDuration > today.getTime()
    ).length;

    const failedToday = executions.filter(m => 
      m.failedSteps > 0 && m.totalDuration > today.getTime()
    ).length;

    const avgExecutionTime = executions.length > 0
      ? executions.reduce((sum, m) => sum + m.totalDuration, 0) / executions.length
      : 0;

    return {
      activeWorkflows: executions.filter(m => m.completedSteps < m.totalSteps).length,
      completedToday,
      failedToday,
      averageExecutionTime: avgExecutionTime,
      resourceUsage: {
        cpu: Math.random() * 0.8, // Mock data - replace with real metrics
        memory: Math.random() * 0.7,
        network: Math.random() * 0.6
      }
    };
  }
}

export const workflowMonitoringService = WorkflowMonitoringService.getInstance();
