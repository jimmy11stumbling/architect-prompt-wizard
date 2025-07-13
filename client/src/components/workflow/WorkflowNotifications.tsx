import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import { workflowNotificationService, WorkflowNotification } from "@/services/workflow/workflowNotificationService";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

const WorkflowNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = workflowNotificationService.subscribe((notifications) => {
      if (mounted) {
        setNotifications(notifications);
        setUnreadCount(workflowNotificationService.getUnreadCount());
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleMarkAsRead = (id: string) => {
    workflowNotificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    workflowNotificationService.markAllAsRead();
    toast({
      title: "All notifications marked as read",
      duration: 2000
    });
  };

  const handleRemoveNotification = (id: string) => {
    workflowNotificationService.removeNotification(id);
  };

  const handleActionClick = async (action: any) => {
    // Prevent multiple clicks
    if (action._executing) return;
    action._executing = true;
    
    try {
      await action.action();
      toast({
        title: "Action completed",
        description: `${action.label} executed successfully`,
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      action._executing = false;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case "success": return "default";
      case "error": return "destructive";
      case "warning": return "outline";
      case "info": return "secondary";
      default: return "outline";
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <BellRing className="h-5 w-5 text-orange-500" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
              Workflow Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  workflowNotificationService.dismissAllNotifications();
                  toast({
                    title: "Notifications Cleared",
                    description: "All notifications have been dismissed.",
                  });
                }}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All ({notifications.length})
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg ${
                    !notification.read ? 'bg-accent/50 border-primary/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <Badge variant={getNotificationVariant(notification.type)} size="sm">
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          {notification.workflowId && (
                            <Badge variant="outline" size="sm">
                              {notification.workflowId}
                            </Badge>
                          )}
                          {notification.executionId && (
                            <Badge variant="outline" size="sm">
                              Exec: {notification.executionId.slice(-8)}
                            </Badge>
                          )}
                        </div>

                        {/* Notification Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {notification.actions.map((action) => (
                              <Button
                                key={action.id}
                                size="sm"
                                variant={action.variant || "outline"}
                                onClick={() => handleActionClick(action)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notification Controls */}
                    <div className="flex gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      {!notification.persistent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowNotifications;