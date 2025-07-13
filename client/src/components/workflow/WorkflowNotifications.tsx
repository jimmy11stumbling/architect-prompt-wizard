
import React, { useEffect, useState, useCallback, useRef } from "react";
import { workflowNotificationService, WorkflowNotification } from "../../services/workflow/workflowNotificationService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X, Bell, BellRing, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "../../hooks/use-toast";

const WorkflowNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const subscriptionRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  const handleNotificationUpdate = useCallback((newNotifications: WorkflowNotification[]) => {
    if (mountedRef.current) {
      setNotifications(newNotifications);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Clear any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current();
    }

    // Create new subscription
    subscriptionRef.current = workflowNotificationService.subscribe(handleNotificationUpdate);

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [handleNotificationUpdate]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = useCallback((id: string) => {
    try {
      workflowNotificationService.markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    try {
      workflowNotificationService.markAllAsRead();
      toast({
        title: "All notifications marked as read",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, []);

  const handleRemove = useCallback((id: string) => {
    try {
      workflowNotificationService.removeNotification(id);
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }, []);

  const handleDismissAll = useCallback(() => {
    try {
      workflowNotificationService.dismissAllNotifications();
      toast({
        title: "All notifications dismissed",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error dismissing notifications:', error);
    }
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "warning": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "error": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!isOpen && unreadCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="relative"
          variant="outline"
          size="sm"
        >
          {unreadCount > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1 py-0 min-w-[20px] h-5 bg-red-500 text-white text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      ) : (
        <Card className="w-80 max-h-96 overflow-hidden shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </CardTitle>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    onClick={handleMarkAllAsRead}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  >
                    <CheckCheck className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  onClick={handleDismissAll}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-2 ${getTypeColor(notification.type)} ${
                        !notification.read ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getTypeColor(notification.type)}`}
                            >
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {notification.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  size="sm"
                                  variant={action.variant || "outline"}
                                  onClick={action.action}
                                  className="h-6 px-2 text-xs"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {!notification.read && (
                            <Button
                              onClick={() => handleMarkAsRead(notification.id)}
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                            >
                              <CheckCheck className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleRemove(notification.id)}
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowNotifications;
