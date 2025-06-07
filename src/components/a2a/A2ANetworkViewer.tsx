
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Network, Users, MessageSquare, Send, Activity, Bot } from "lucide-react";
import { a2aService } from "@/services/a2a/a2aService";
import { A2AAgent, A2AMessage } from "@/types/ipa-types";
import { useToast } from "@/hooks/use-toast";

const A2ANetworkViewer: React.FC = () => {
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState({
    to: "",
    type: "notification" as "request" | "response" | "notification",
    payload: ""
  });
  const { toast } = useToast();

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const agentList = a2aService.getAllAgents();
      setAgents(agentList);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch A2A agents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const messageList = a2aService.getAllMessages();
      setMessages(messageList.slice(-20)); // Show last 20 messages
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.to || !newMessage.payload) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient and message content",
        variant: "destructive"
      });
      return;
    }

    try {
      let payload;
      try {
        payload = JSON.parse(newMessage.payload);
      } catch {
        payload = { message: newMessage.payload };
      }

      const message = await a2aService.sendMessage({
        from: "dashboard-user",
        to: newMessage.to,
        type: newMessage.type,
        payload
      });

      toast({
        title: "Message Sent",
        description: `Message sent to ${newMessage.to}`
      });

      setNewMessage({ to: "", type: "notification", payload: "" });
      await fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Send Failed",
        description: "Failed to send A2A message",
        variant: "destructive"
      });
    }
  };

  const delegateTask = async (task: string, capabilities: string[]) => {
    try {
      const result = await a2aService.delegateTask(task, capabilities);
      toast({
        title: "Task Delegated",
        description: `Task assigned to ${result.assignedAgent?.name || "available agent"}`
      });
      await fetchAgents();
    } catch (error) {
      console.error("Task delegation failed:", error);
      toast({
        title: "Delegation Failed",
        description: "Failed to delegate task",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchMessages();
    
    const interval = setInterval(() => {
      fetchAgents();
      fetchMessages();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500";
      case "busy": return "text-yellow-500";
      case "inactive": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "request": return "border-l-blue-500";
      case "response": return "border-l-green-500";
      case "notification": return "border-l-yellow-500";
      default: return "border-l-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            A2A Network Status
          </CardTitle>
          <Button onClick={fetchAgents} disabled={isLoading} size="sm" variant="outline">
            <Activity className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{agents.length}</div>
              <div className="text-sm text-muted-foreground">Total Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {agents.filter(a => a.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{messages.length}</div>
              <div className="text-sm text-muted-foreground">Recent Messages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="send">Send Message</TabsTrigger>
          <TabsTrigger value="delegate">Delegate Task</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">No Agents Found</h3>
                <p className="text-sm text-muted-foreground">
                  The A2A network is initializing. Agents will appear here once connected.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Agent ID:</Label>
                        <div className="text-sm font-mono">{agent.id}</div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Capabilities:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.capabilities.map((cap, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Last Seen:</Label>
                        <div className="text-sm">
                          {new Date(agent.lastSeen).toLocaleString()}
                        </div>
                      </div>

                      {agent.endpoint && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Endpoint:</Label>
                          <div className="text-sm font-mono break-all">{agent.endpoint}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">No Messages</h3>
                <p className="text-sm text-muted-foreground">
                  Agent communication messages will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <Card key={message.id} className={`border-l-4 ${getMessageTypeColor(message.type)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{message.from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{message.to}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {message.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {message.priority && (
                        <Badge variant={message.priority === "high" ? "destructive" : "secondary"}>
                          {message.priority}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 p-3 bg-muted rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(message.payload, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send A2A Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Agent ID</Label>
                  <Input
                    id="recipient"
                    placeholder="agent-id"
                    value={newMessage.to}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Message Type</Label>
                  <select
                    id="type"
                    className="w-full p-2 border rounded"
                    value={newMessage.type}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="notification">Notification</option>
                    <option value="request">Request</option>
                    <option value="response">Response</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payload">Message Payload (JSON)</Label>
                <Textarea
                  id="payload"
                  placeholder='{"message": "Hello", "data": {...}}'
                  value={newMessage.payload}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, payload: e.target.value }))}
                  rows={4}
                />
              </div>

              <Button onClick={sendMessage} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>

              <div className="mt-4 p-3 bg-muted rounded text-sm">
                <strong>Available Agents:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {agents.map((agent) => (
                    <Button
                      key={agent.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewMessage(prev => ({ ...prev, to: agent.id }))}
                      className="text-xs"
                    >
                      {agent.name} ({agent.id})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delegate">
          <Card>
            <CardHeader>
              <CardTitle>Task Delegation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => delegateTask("Analyze system performance", ["analysis", "monitoring"])}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <span className="font-medium">Performance Analysis</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Delegate system performance analysis task
                  </span>
                </Button>

                <Button
                  onClick={() => delegateTask("Process user query", ["query-processing", "nlp"])}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <span className="font-medium">Query Processing</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Delegate natural language query processing
                  </span>
                </Button>

                <Button
                  onClick={() => delegateTask("Generate documentation", ["documentation", "writing"])}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <span className="font-medium">Documentation</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Delegate documentation generation task
                  </span>
                </Button>

                <Button
                  onClick={() => delegateTask("Monitor integrations", ["monitoring", "integration"])}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <span className="font-medium">Integration Monitoring</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Delegate integration monitoring task
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default A2ANetworkViewer;
