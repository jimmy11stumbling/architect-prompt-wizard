
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, 
  Users, 
  MessageSquare, 
  Send, 
  Activity, 
  Clock,
  CheckCircle,
  AlertCircle,
  Bot
} from "lucide-react";
import { A2AAgent, A2AMessage } from "@/types/ipa-types";
import { useToast } from "@/hooks/use-toast";

const A2ANetworkViewer: React.FC = () => {
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<A2AAgent | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [targetAgent, setTargetAgent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
    loadMessages();
  }, []);

  const loadAgents = async () => {
    // Mock A2A agents
    const mockAgents: A2AAgent[] = [
      {
        id: "reasoning-assistant",
        name: "Reasoning Assistant",
        status: "active",
        capabilities: ["reasoning", "analysis", "problem-solving"],
        endpoint: "ws://localhost:8001/a2a",
        lastSeen: Date.now() - 60000
      },
      {
        id: "context-analyzer",
        name: "Context Analyzer", 
        status: "active",
        capabilities: ["context-analysis", "document-processing", "summarization"],
        endpoint: "ws://localhost:8002/a2a",
        lastSeen: Date.now() - 30000
      },
      {
        id: "documentation-expert",
        name: "Documentation Expert",
        status: "busy",
        capabilities: ["documentation", "writing", "technical-writing"],
        endpoint: "ws://localhost:8003/a2a",
        lastSeen: Date.now() - 15000
      },
      {
        id: "workflow-coordinator",
        name: "Workflow Coordinator",
        status: "active",
        capabilities: ["coordination", "task-management", "scheduling"],
        endpoint: "ws://localhost:8004/a2a",
        lastSeen: Date.now() - 5000
      }
    ];
    
    setAgents(mockAgents);
    if (!selectedAgent && mockAgents.length > 0) {
      setSelectedAgent(mockAgents[0]);
    }
  };

  const loadMessages = async () => {
    // Mock A2A messages
    const mockMessages: A2AMessage[] = [
      {
        id: "msg-1",
        from: "reasoning-assistant",
        to: "context-analyzer",
        type: "request",
        payload: { task: "analyze_document", document_id: "doc-123" },
        timestamp: Date.now() - 300000,
        priority: "high"
      },
      {
        id: "msg-2",
        from: "context-analyzer",
        to: "reasoning-assistant", 
        type: "response",
        payload: { result: "analysis_complete", insights: ["key_point_1", "key_point_2"] },
        timestamp: Date.now() - 250000,
        priority: "high"
      },
      {
        id: "msg-3",
        from: "workflow-coordinator",
        to: "documentation-expert",
        type: "notification",
        payload: { status: "task_assigned", task_id: "task-456" },
        timestamp: Date.now() - 120000,
        priority: "normal"
      }
    ];
    
    setMessages(mockMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !targetAgent) {
      toast({
        title: "Message Required",
        description: "Please enter a message and select a target agent",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const message: A2AMessage = {
        id: `msg-${Date.now()}`,
        from: "system-dashboard",
        to: targetAgent,
        type: "notification",
        payload: { content: newMessage.trim() },
        timestamp: Date.now(),
        priority: "normal"
      };

      setMessages(prev => [message, ...prev]);
      setNewMessage("");
      setTargetAgent("");
      
      toast({
        title: "Message Sent",
        description: `Message sent to ${targetAgent} successfully`
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Send Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "busy":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case "inactive":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "request":
        return "bg-blue-100 text-blue-800";
      case "response":
        return "bg-green-100 text-green-800";
      case "notification":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            A2A Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{agents.length}</div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{messages.length}</div>
              <div className="text-sm text-muted-foreground">Messages Exchanged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {agents.filter(a => a.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Online Now</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agent Network</TabsTrigger>
          <TabsTrigger value="messages">Message History</TabsTrigger>
          <TabsTrigger value="send">Send Message</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Card 
                key={agent.id}
                className={`cursor-pointer transition-colors ${
                  selectedAgent?.id === agent.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      {agent.name}
                    </div>
                    {getStatusIcon(agent.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge 
                        variant={agent.status === "active" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium mb-2 block">Capabilities:</span>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last seen:</span>
                      <span>{new Date(agent.lastSeen).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Endpoint:</span> {agent.endpoint}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getMessageTypeColor(message.type)}>
                          {message.type}
                        </Badge>
                        <span className="text-sm font-medium">
                          {message.from} → {message.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {message.priority && (
                          <Badge 
                            variant={message.priority === "high" ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            {message.priority}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-muted p-2 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(message.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No messages in history
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Message to Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-agent">Target Agent</Label>
                <select
                  id="target-agent"
                  className="w-full px-3 py-2 border rounded-md"
                  value={targetAgent}
                  onChange={(e) => setTargetAgent(e.target.value)}
                >
                  <option value="">Select an agent...</option>
                  {agents.filter(a => a.status === "active").map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message-content">Message Content</Label>
                <Textarea
                  id="message-content"
                  placeholder="Enter your message content..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={sendMessage}
                disabled={isLoading || !newMessage.trim() || !targetAgent}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default A2ANetworkViewer;
