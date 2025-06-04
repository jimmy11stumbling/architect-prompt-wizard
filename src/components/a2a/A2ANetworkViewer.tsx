
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Send, MessageSquare, Users, Activity } from "lucide-react";
import { a2aService, A2AMessage } from "@/services/a2a/a2aService";
import { A2AAgent } from "@/types/ipa-types";

const A2ANetworkViewer: React.FC = () => {
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState<"request" | "notification">("request");

  useEffect(() => {
    loadNetworkData();
    const interval = setInterval(loadNetworkData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadNetworkData = () => {
    setAgents(a2aService.getAgents());
    setMessages(a2aService.getMessageHistory());
  };

  const sendMessage = async () => {
    if (!selectedAgent || !messageContent.trim()) return;

    const message: A2AMessage = {
      id: `msg-${Date.now()}`,
      from: "user-interface",
      to: selectedAgent,
      type: messageType,
      payload: { content: messageContent },
      timestamp: Date.now()
    };

    try {
      await a2aService.sendMessage(message);
      setMessageContent("");
      loadNetworkData();
    } catch (error) {
      console.error("Failed to send A2A message:", error);
    }
  };

  const delegateTask = async () => {
    if (!messageContent.trim()) return;

    try {
      const result = await a2aService.delegateTask(
        messageContent,
        ["document-retrieval", "semantic-search", "tool-orchestration"]
      );
      
      if (result.assignedAgent) {
        console.log("Task delegated to:", result.assignedAgent.name);
        loadNetworkData();
      }
    } catch (error) {
      console.error("Failed to delegate task:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-800";
      case "busy": return "bg-yellow-100 text-yellow-800";
      case "offline": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            A2A Network Control Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{agents.length}</div>
              <div className="text-sm text-muted-foreground">Connected Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{messages.length}</div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {agents.filter(a => a.status === "online").length}
              </div>
              <div className="text-sm text-muted-foreground">Online Agents</div>
            </div>
          </div>

          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="control">Control Panel</TabsTrigger>
            </TabsList>

            <TabsContent value="agents">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{agent.name}</h3>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Capabilities</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {agent.capabilities.map((cap) => (
                              <Badge key={cap} variant="outline" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Endpoint</Label>
                          <div className="text-xs text-muted-foreground font-mono">
                            {agent.endpoint}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.slice(-20).reverse().map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={message.type === "request" ? "default" : "secondary"}>
                          {message.type}
                        </Badge>
                        <span className="text-sm font-medium">
                          {message.from} → {message.to}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">
                        {JSON.stringify(message.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages in the network yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="control">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Send Message</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Target Agent</Label>
                      <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Message Type</Label>
                      <Select value={messageType} onValueChange={(value: "request" | "notification") => setMessageType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="request">Request</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Message Content</Label>
                      <Textarea
                        placeholder="Enter message content..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={sendMessage}
                        disabled={!selectedAgent || !messageContent.trim()}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={delegateTask}
                        disabled={!messageContent.trim()}
                        className="flex-1"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Delegate Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default A2ANetworkViewer;
