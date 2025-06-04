
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, MessageSquare, Settings, Activity, Send } from "lucide-react";
import { a2aService, A2AMessage } from "@/services/a2a/a2aService";
import { A2AAgent } from "@/types/ipa-types";

const A2ANetworkViewer: React.FC = () => {
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [messageContent, setMessageContent] = useState("");
  const [realTimeLog, setRealTimeLog] = useState<string[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<any>({});

  useEffect(() => {
    initializeA2A();
    const interval = setInterval(refreshNetworkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const initializeA2A = async () => {
    if (!a2aService.isInitialized()) {
      await a2aService.initialize();
    }
    refreshNetworkStatus();
  };

  const refreshNetworkStatus = () => {
    setAgents(a2aService.getAgents());
    setMessages(a2aService.getMessages());
    setNetworkMetrics(a2aService.getAgentMetrics());
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setRealTimeLog(prev => [...prev.slice(-9), logEntry]);
    console.log("A2A:", logEntry);
  };

  const sendTestMessage = async () => {
    if (!selectedAgent || !messageContent.trim()) return;

    const message: A2AMessage = {
      id: `msg-${Date.now()}`,
      from: "a2a-interface",
      to: selectedAgent,
      type: "request",
      payload: { content: messageContent },
      timestamp: Date.now(),
      priority: "medium"
    };

    try {
      addToLog(`📤 Sending message to ${selectedAgent}`);
      const response = await a2aService.sendMessage(message);
      
      if (response) {
        addToLog(`📥 Received response from ${response.from}`);
        refreshNetworkStatus();
      }
      
      setMessageContent("");
    } catch (error) {
      addToLog(`❌ Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`);
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

  const delegateTask = async () => {
    try {
      addToLog("🎯 Delegating test task to network");
      const delegation = await a2aService.delegateTask(
        "Test task delegation from A2A interface",
        ["document-retrieval", "semantic-search"]
      );
      
      addToLog(`✅ Task ${delegation.taskId} delegated to ${delegation.assignedAgent?.name || "no agent"}`);
      refreshNetworkStatus();
    } catch (error) {
      addToLog(`❌ Task delegation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            A2A Network Management Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{networkMetrics.totalAgents || 0}</div>
              <div className="text-sm text-muted-foreground">Total Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{networkMetrics.onlineAgents || 0}</div>
              <div className="text-sm text-muted-foreground">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{networkMetrics.totalMessages || 0}</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{networkMetrics.activeTasks || 0}</div>
              <div className="text-sm text-muted-foreground">Active Tasks</div>
            </div>
          </div>

          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="logs">Real-time Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="agents">
              <div className="space-y-4">
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
                        <span className="text-xs font-medium">Agent ID:</span>
                        <div className="text-xs text-muted-foreground font-mono">
                          {agent.id}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium">Endpoint:</span>
                        <div className="text-xs text-muted-foreground font-mono">
                          {agent.endpoint}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium">Capabilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.capabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.slice(-10).reverse().map((message) => (
                  <div key={message.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {message.from} → {message.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {message.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs bg-muted p-2 rounded">
                      <pre className="whitespace-pre-wrap">
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

            <TabsContent value="testing">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Send Test Message</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Target Agent</label>
                      <select
                        className="w-full mt-1 p-2 border rounded"
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                      >
                        <option value="">Select an agent...</option>
                        {agents.filter(a => a.status === "online").map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Message Content</label>
                      <Textarea
                        placeholder="Enter test message content..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={sendTestMessage}
                        disabled={!selectedAgent || !messageContent.trim()}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={delegateTask}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Test Delegation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-xs space-y-1 max-h-64 overflow-y-auto bg-muted p-3 rounded">
                    {realTimeLog.length > 0 ? (
                      realTimeLog.map((log, index) => (
                        <div key={index} className="text-muted-foreground">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No activity logs yet. Send a message or delegate a task to see real-time updates.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default A2ANetworkViewer;
