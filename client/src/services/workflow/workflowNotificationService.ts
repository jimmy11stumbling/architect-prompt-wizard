
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
  private readonly THROTTLE_DELAY = 10000; // 10 seconds between similar notifications
  private readonly MAX_NOTIFICATIONS = 10;
  private readonly NOTIFICATIONS_ENABLED = true;
  private a2aThrottle = new Map<string, number>();
  private readonly A2A_THROTTLE_DELAY = 30000; // 30 seconds for A2A notifications
  private agentCompletionCount = new Map<string, number>();

  static getInstance(): WorkflowNotificationService {
    if (!WorkflowNotificationService.instance) {
      WorkflowNotificationService.instance = new WorkflowNotificationService();
    }
    return WorkflowNotificationService.instance;
  }

  constructor() {
    if (this.NOTIFICATIONS_ENABLED) {
      this.subscribeToRealTimeEvents();
    }
    console.log(`Workflow notifications ${this.NOTIFICATIONS_ENABLED ? 'enabled' : 'disabled'}`);
  }

  private subscribeToRealTimeEvents() {
    // Subscribe to real-time events with throttling
    realTimeResponseService.subscribe((event) => {
      this.handleRealTimeEventThrottled(event);
    });
  }

  private handleRealTimeEventThrottled(event: any) {
    if (!this.NOTIFICATIONS_ENABLED) {
      return;
    }

    // Skip streaming events entirely
    if (event.status === "streaming" || event.type === "streaming") {
      return;
    }

    // Special handling for A2A notifications - heavily throttle them
    if (event.source?.includes("A2A") || event.message?.includes("→")) {
      this.handleA2ANotification(event);
      return;
    }

    // Skip agent processing logs that flood the system
    if (event.message?.includes("agent-processing") || 
        event.message?.includes("Agent") && event.message?.includes("started processing")) {
      return;
    }

    const eventKey = `${event.source}-${event.status}-${event.data?.workflowId || 'unknown'}`;
    const now = Date.now();

    // Check if we should throttle this event
    if (this.notificationThrottle.has(eventKey)) {
      const lastNotification = this.notificationThrottle.get(eventKey)!;
      if (now - lastNotification < this.THROTTLE_DELAY) {
        return;
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
      case "deepseek-reasoner":
        this.handleDeepSeekEvent(event);
        break;
      case "rag-service":
        this.handleRAGEvent(event);
        break;
      case "mcp-service":
        this.handleMCPEvent(event);
        break;
    }
  }

  private handleA2ANotification(event: any) {
    if (!this.NOTIFICATIONS_ENABLED) return;

    // Extract agent name from A2A messages
    const agentMatch = event.message?.match(/Agent ([\w-]+) completed/);
    if (agentMatch) {
      const agentName = agentMatch[1];
      const now = Date.now();
      
      // Count completions per agent
      const currentCount = this.agentCompletionCount.get(agentName) || 0;
      this.agentCompletionCount.set(agentName, currentCount + 1);

      // Only notify every 5th completion for frequently completing agents
      if (currentCount % 5 !== 0) {
        return;
      }

      // Check A2A throttle
      const throttleKey = `a2a-${agentName}`;
      if (this.a2aThrottle.has(throttleKey)) {
        const lastNotification = this.a2aThrottle.get(throttleKey)!;
        if (now - lastNotification < this.A2A_THROTTLE_DELAY) {
          return;
        }
      }

      this.a2aThrottle.set(throttleKey, now);

      this.addNotification({
        type: "info",
        title: "Agent Coordination",
        message: `Agent ${agentName} has completed ${currentCount + 1} tasks`,
        workflowId: "a2a-coordination",
        persistent: false
      });
    }
  }

  private cleanupThrottleMap() {
    const now = Date.now();
    for (const [key, timestamp] of this.notificationThrottle.entries()) {
      if (now - timestamp > this.THROTTLE_DELAY * 2) {
        this.notificationThrottle.delete(key);
      }
    }
    
    // Clean up A2A throttle
    for (const [key, timestamp] of this.a2aThrottle.entries()) {
      if (now - timestamp > this.A2A_THROTTLE_DELAY * 2) {
        this.a2aThrottle.delete(key);
      }
    }
  }

  private removeOldestNotifications() {
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => a.timestamp - b.timestamp);

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
            persistent: true
          });
        }
        break;
    }
  }

  private handleErrorEvent(event: any) {
    const { status, message, data } = event;

    if (status === "error" && data?.severity === "critical") {
      this.addNotification({
        type: "error",
        title: "Critical Error",
        message: `Critical error: ${message}`,
        workflowId: data.workflowId || "unknown",
        executionId: data.executionId,
        stepId: data.stepId,
        persistent: true
      });
    }
  }

  private handleMonitoringEvent(event: any) {
    const { status, message, data } = event;

    if (status === "warning" && data?.type === "resource") {
      this.addNotification({
        type: "warning",
        title: "Resource Alert",
        message: message,
        workflowId: "system",
        persistent: false
      });
    }
  }

  private handleDeepSeekEvent(event: any) {
    const { status, message, data } = event;

    if (status === "completed") {
      this.addNotification({
        type: "success",
        title: "DeepSeek Analysis Complete",
        message: "Advanced reasoning analysis completed successfully",
        workflowId: data.workflowId || "deepseek-reasoner",
        executionId: data.executionId,
        persistent: false
      });
    } else if (status === "error") {
      this.addNotification({
        type: "error",
        title: "DeepSeek Error",
        message: message || "DeepSeek reasoning failed",
        workflowId: data.workflowId || "deepseek-reasoner",
        executionId: data.executionId,
        persistent: true
      });
    }
  }

  private handleRAGEvent(event: any) {
    const { status, message, data } = event;

    if (status === "completed" && data?.documentsFound > 0) {
      this.addNotification({
        type: "success",
        title: "Knowledge Retrieved",
        message: `Found ${data.documentsFound} relevant documents`,
        workflowId: data.workflowId || "rag-service",
        executionId: data.executionId,
        persistent: false
      });
    } else if (status === "error") {
      this.addNotification({
        type: "error",
        title: "Knowledge Retrieval Error",
        message: message || "Failed to retrieve knowledge",
        workflowId: data.workflowId || "rag-service",
        executionId: data.executionId,
        persistent: true
      });
    }
  }

  private handleMCPEvent(event: any) {
    const { status, message, data } = event;

    if (status === "completed" && data?.toolsExecuted > 0) {
      this.addNotification({
        type: "success",
        title: "Tools Executed",
        message: `${data.toolsExecuted} tools executed successfully`,
        workflowId: data.workflowId || "mcp-service",
        executionId: data.executionId,
        persistent: false
      });
    } else if (status === "error") {
      this.addNotification({
        type: "error",
        title: "Tool Execution Error",
        message: message || "Tool execution failed",
        workflowId: data.workflowId || "mcp-service",
        executionId: data.executionId,
        persistent: true
      });
    }
  }

  addNotification(notification: Partial<WorkflowNotification>): string {
    if (!this.NOTIFICATIONS_ENABLED) {
      return "";
    }

    const id = this.generateNotificationId();
    const fullNotification: WorkflowNotification = {
      id,
      type: "info",
      title: "Notification",
      message: "",
      workflowId: "unknown",
      timestamp: Date.now(),
      read: false,
      persistent: false,
      ...notification
    };

    this.notifications.set(id, fullNotification);
    
    // Auto-remove non-persistent notifications after 10 seconds
    if (!fullNotification.persistent) {
      setTimeout(() => {
        this.removeNotification(id);
      }, 10000);
    }

    this.notifySubscribers();
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
    // Immediately call with current notifications
    callback(this.getNotifications());
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    const notifications = this.getNotifications();
    this.subscribers.forEach(callback => {
      try {
        callback(notifications);
      } catch (error) {
        console.error("Error notifying subscriber:", error);
      }
    });
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Action handlers
  private async retryWorkflow(executionId: string): Promise<void> {
    console.log(`Retrying workflow execution: ${executionId}`);
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
    this.a2aThrottle.clear();
    this.agentCompletionCount.clear();
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
