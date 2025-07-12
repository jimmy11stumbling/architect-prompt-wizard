import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface WorkflowNotification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  workflowId: string;
  executionId?: string;
  stepId?: string;
  timestamp: number;
  read: boolean;
  persistent: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  type: "button" | "link";
  action: () => void | Promise<void>;
  variant?: "default" | "destructive" | "outline";
}

export class WorkflowNotificationService {
  private static instance: WorkflowNotificationService;
  private notifications = new Map<string, WorkflowNotification>();
  private subscribers = new Set<(notifications: WorkflowNotification[]) => void>();
  private notificationThrottle = new Map<string, number>();
  private readonly THROTTLE_DELAY = 5000; // 5 seconds
  private readonly MAX_NOTIFICATIONS = 10;

  static getInstance(): WorkflowNotificationService {
    if (!WorkflowNotificationService.instance) {
      WorkflowNotificationService.instance = new WorkflowNotificationService();
    }
    return WorkflowNotificationService.instance;
  }

  constructor() {
    // Subscribe to real-time events with throttling
    realTimeResponseService.subscribe((response) => {
      this.handleRealTimeEventThrottled(response);
    });
  }

  private handleRealTimeEventThrottled(event: any) {
    const eventKey = `${event.source}-${event.status}-${event.data?.workflowId || 'unknown'}`;
    const now = Date.now();
    
    // Check if we should throttle this event
    if (this.notificationThrottle.has(eventKey)) {
      const lastNotification = this.notificationThrottle.get(eventKey)!;
      if (now - lastNotification < this.THROTTLE_DELAY) {
        return; // Skip this notification
      }
    }
    
    // Update throttle timestamp
    this.notificationThrottle.set(eventKey, now);
    
    // Clean up old throttle entries
    this.cleanupThrottleMap();
    
    // Check notification limit
    if (this.notifications.size >= this.MAX_NOTIFICATIONS) {
      this.removeOldestNotifications();
    }
    
    // Convert real-time events to notifications
    switch (event.source) {
      case "workflow-engine":
        this.handleWorkflowEvent(event);
        break;
      case "workflow-error-handler":
        this.handleErrorEvent(event);
        break;
      case "workflow-monitoring":
        this.handleMonitoringEvent(event);
        break;
    }
  }

  private cleanupThrottleMap() {
    const now = Date.now();
    for (const [key, timestamp] of this.notificationThrottle.entries()) {
      if (now - timestamp > this.THROTTLE_DELAY * 2) {
        this.notificationThrottle.delete(key);
      }
    }
  }

  private removeOldestNotifications() {
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest non-persistent notifications
    for (const notification of notifications) {
      if (!notification.persistent) {
        this.notifications.delete(notification.id);
        break;
      }
    }
  }

  private handleWorkflowEvent(event: any) {
    const { status, message, data } = event;

    switch (status) {
      case "success":
        if (message.includes("completed successfully")) {
          this.addNotification({
            type: "success",
            title: "Workflow Completed",
            message: message,
            workflowId: data.workflowId || "unknown",
            executionId: data.executionId,
            persistent: false
          });
        }
        break;

      case "error":
        this.addNotification({
          type: "error",
          title: "Workflow Failed",
          message: message,
          workflowId: data.workflowId || "unknown",
          executionId: data.executionId,
          persistent: true,
          actions: [
            {
              id: "retry",
              label: "Retry",
              type: "button",
              action: () => this.retryWorkflow(data.executionId),
              variant: "default"
            },
            {
              id: "view_logs",
              label: "View Logs",
              type: "button", 
              action: () => this.viewExecutionLogs(data.executionId),
              variant: "outline"
            }
          ]
        });
        break;

      case "warning":
        if (message.includes("paused")) {
          this.addNotification({
            type: "warning",
            title: "Workflow Paused",
            message: message,
            workflowId: data.workflowId || "unknown",
            executionId: data.executionId,
            persistent: true,
            actions: [
              {
                id: "resume",
                label: "Resume",
                type: "button",
                action: () => this.resumeWorkflow(data.executionId),
                variant: "default"
              }
            ]
          });
        }
        break;
    }
  }

  private handleErrorEvent(event: any) {
    const { status, message, data } = event;

    if (status === "error" && data.severity === "critical") {
      this.addNotification({
        type: "error",
        title: "Critical Error",
        message: `Critical error in step ${data.stepId}: ${message}`,
        workflowId: data.workflowId || "unknown",
        executionId: data.executionId,
        stepId: data.stepId,
        persistent: true,
        actions: [
          {
            id: "investigate",
            label: "Investigate",
            type: "button",
            action: () => this.investigateError(data.errorId),
            variant: "destructive"
          }
        ]
      });
    }
  }

  private handleMonitoringEvent(event: any) {
    const { status, message, data } = event;

    if (status === "warning" && data.type === "resource") {
      this.addNotification({
        type: "warning",
        title: "Resource Alert",
        message: message,
        workflowId: "system",
        persistent: false
      });
    }
  }

  addNotification(notification: Partial<WorkflowNotification>): string {
    const id = this.generateNotificationId();
    const fullNotification: WorkflowNotification = {
      id,
      type: "info",
      title: "",
      message: "",
      workflowId: "",
      timestamp: Date.now(),
      read: false,
      persistent: false,
      ...notification
    };

    this.notifications.set(id, fullNotification);
    this.notifySubscribers();

    // Auto-remove non-persistent notifications after 10 seconds
    if (!fullNotification.persistent) {
      setTimeout(() => {
        this.removeNotification(id);
      }, 10000);
    }

    return id;
  }

  removeNotification(id: string): void {
    this.notifications.delete(id);
    this.notifySubscribers();
  }

  markAsRead(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notifySubscribers();
  }

  getNotifications(): WorkflowNotification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getUnreadNotifications(): WorkflowNotification[] {
    return this.getNotifications().filter(n => !n.read);
  }

  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  subscribe(callback: (notifications: WorkflowNotification[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getNotifications()); // Send initial state

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    const notifications = this.getNotifications();
    this.subscribers.forEach(callback => callback(notifications));
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Action handlers
  private async retryWorkflow(executionId: string): Promise<void> {
    // Implementation would depend on workflow engine integration
    console.log(`Retrying workflow execution: ${executionId}`);
  }

  private async resumeWorkflow(executionId: string): Promise<void> {
    // Implementation would depend on workflow engine integration
    console.log(`Resuming workflow execution: ${executionId}`);
  }

  private async viewExecutionLogs(executionId: string): Promise<void> {
    // Implementation would open logs view
    console.log(`Viewing logs for execution: ${executionId}`);
  }

  private async investigateError(errorId: string): Promise<void> {
    // Implementation would open error details
    console.log(`Investigating error: ${errorId}`);
  }

  // Utility methods
  clearOldNotifications(olderThanDays: number = 7): void {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const toRemove: string[] = [];

    this.notifications.forEach((notification, id) => {
      if (notification.timestamp < cutoffTime && !notification.persistent) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => this.notifications.delete(id));
    this.notifySubscribers();
  }

  dismissAllNotifications(): void {
    this.notifications.clear();
    this.notificationThrottle.clear();
    this.notifySubscribers();
  }

  dismissNotificationsByType(type: "success" | "warning" | "error" | "info"): void {
    const toRemove: string[] = [];
    
    this.notifications.forEach((notification, id) => {
      if (notification.type === type && !notification.persistent) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => this.notifications.delete(id));
    this.notifySubscribers();
  }

  exportNotifications(): WorkflowNotification[] {
    return this.getNotifications();
  }

  getNotificationStatistics(): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byWorkflow: Record<string, number>;
  } {
    const notifications = this.getNotifications();

    return {
      total: notifications.length,
      unread: this.getUnreadCount(),
      byType: notifications.reduce((acc, notif) => {
        acc[notif.type] = (acc[notif.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byWorkflow: notifications.reduce((acc, notif) => {
        acc[notif.workflowId] = (acc[notif.workflowId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const workflowNotificationService = WorkflowNotificationService.getInstance();