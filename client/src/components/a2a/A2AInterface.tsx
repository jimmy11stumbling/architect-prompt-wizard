import React, { useState, useEffect } from "react";
import { Users, MessageCircle, Zap, BarChart3, GitBranch, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface A2AStats {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  averageTaskTime: number;
}

interface TaskResult {
  id: string;
  description: string;
  requiredCapabilities: string[];
  priority: string;
  assignedAgents: string[];
  status: string;
  created: string;
}

interface NegotiationResult {
  winner?: string;
  proposals: Array<{
    performative: string;
    sender: { name: string };
    content: string;
  }>;
}

export const A2AInterface: React.FC = () => {
  const [stats, setStats] = useState<A2AStats | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskCapabilities, setTaskCapabilities] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null);
  const [collaborativeAgents, setCollaborativeAgents] = useState("");
  const [coordinationStrategy, setCoordinationStrategy] = useState("parallel");
  const [collaborativeResult, setCollaborativeResult] = useState<any>(null);
  const [negotiationInitiator, setNegotiationInitiator] = useState("reasoning-assistant");
  const [negotiationParticipants, setNegotiationParticipants] = useState("context-analyzer,documentation-expert");
  const [negotiationTask, setNegotiationTask] = useState("");
  const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const initializeA2A = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/a2a/initialize", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setIsInitialized(true);
        toast({
          title: "A2A System Initialized",
          description: "Agent-to-Agent communication system is ready"
        });
      } else {
        throw new Error("Failed to initialize A2A");
      }
    } catch (error) {
      toast({
        title: "A2A Initialization Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/a2a/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setIsInitialized(data.totalAgents > 0);
      }
    } catch (error) {
      console.error("Error fetching A2A stats:", error);
    }
  };

  const createTask = async () => {
    if (!taskDescription.trim()) return;

    setLoading(true);
    try {
      const capabilities = taskCapabilities.split(",").map(c => c.trim()).filter(c => c);
      
      const response = await fetch("/api/a2a/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: taskDescription,
          requiredCapabilities: capabilities,
          priority: taskPriority
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTaskResult(data.result);
        toast({
          title: "Task Created Successfully",
          description: `Task ${data.result.id} has been created and assigned`
        });
        fetchStats();
      } else {
        throw new Error("Failed to create task");
      }
    } catch (error) {
      toast({
        title: "Task Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const executeCollaborativeTask = async () => {
    if (!taskDescription.trim() || !collaborativeAgents.trim()) return;

    setLoading(true);
    try {
      const agents = collaborativeAgents.split(",").map(a => a.trim()).filter(a => a);
      
      const response = await fetch("/api/a2a/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: taskDescription,
          agents,
          strategy: coordinationStrategy
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborativeResult(data.result);
        toast({
          title: "Collaborative Task Executed",
          description: `Task completed using ${coordinationStrategy} coordination`
        });
        fetchStats();
      } else {
        throw new Error("Failed to execute collaborative task");
      }
    } catch (error) {
      toast({
        title: "Collaborative Task Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performNegotiation = async () => {
    if (!negotiationTask.trim() || !negotiationParticipants.trim()) return;

    setLoading(true);
    try {
      const participants = negotiationParticipants.split(",").map(p => p.trim()).filter(p => p);
      
      const response = await fetch("/api/a2a/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiator: negotiationInitiator,
          participants,
          task: negotiationTask
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNegotiationResult(data.result);
        toast({
          title: "Negotiation Completed",
          description: data.result.winner ? `Winner: ${data.result.winner}` : "No winner selected"
        });
      } else {
        throw new Error("Failed to perform negotiation");
      }
    } catch (error) {
      toast({
        title: "Negotiation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agent-to-Agent (A2A) Communication
            </CardTitle>
            <CardDescription>
              Initialize the A2A system to enable multi-agent coordination and communication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={initializeA2A} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Initialize A2A System
            </Button>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">A2A Communication provides:</h4>
              <ul className="text-sm space-y-1">
                <li>• FIPA ACL protocol implementation</li>
                <li>• Multi-agent task coordination</li>
                <li>• Contract Net Protocol negotiation</li>
                <li>• Agent capability matching and assignment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent-to-Agent Communication
          </CardTitle>
          <CardDescription>
            Multi-agent coordination using FIPA ACL protocols
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.totalAgents}</div>
                <div className="text-sm text-muted-foreground">Total Agents</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeAgents}</div>
                <div className="text-sm text-muted-foreground">Active Agents</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pendingTasks}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(stats.averageTaskTime)}ms</div>
                <div className="text-sm text-muted-foreground">Avg Task Time</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="task-creation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="task-creation">
            <MessageCircle className="h-4 w-4 mr-2" />
            Task Creation
          </TabsTrigger>
          <TabsTrigger value="collaboration">
            <GitBranch className="h-4 w-4 mr-2" />
            Collaborative Tasks
          </TabsTrigger>
          <TabsTrigger value="negotiation">
            <BarChart3 className="h-4 w-4 mr-2" />
            Agent Negotiation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="task-creation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Agent Task</CardTitle>
                <CardDescription>
                  Create and assign tasks to available agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Task Description</Label>
                  <Textarea
                    placeholder="Describe the task to be performed..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Required Capabilities (comma-separated)</Label>
                  <Input
                    placeholder="reasoning, analysis, documentation"
                    value={taskCapabilities}
                    onChange={(e) => setTaskCapabilities(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={createTask} 
                  disabled={loading || !taskDescription.trim()}
                  className="w-full flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Create Task
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Result</CardTitle>
                <CardDescription>
                  Details of the created task
                </CardDescription>
              </CardHeader>
              <CardContent>
                {taskResult ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Task ID</Label>
                      <p className="text-sm font-mono">{taskResult.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={taskResult.status === 'completed' ? 'default' : 'secondary'}>
                        {taskResult.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <Badge variant="outline">{taskResult.priority}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Assigned Agents</Label>
                      <div className="flex gap-2 mt-1">
                        {taskResult.assignedAgents.map((agent, index) => (
                          <Badge key={index} variant="secondary">{agent}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">{taskResult.description}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Create a task to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collaborative Task Execution</CardTitle>
                <CardDescription>
                  Execute tasks using multiple agents with different coordination strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Task Description</Label>
                  <Textarea
                    placeholder="Describe the collaborative task..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Agent Names (comma-separated)</Label>
                  <Input
                    placeholder="reasoning-assistant, context-analyzer, documentation-expert"
                    value={collaborativeAgents}
                    onChange={(e) => setCollaborativeAgents(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Coordination Strategy</Label>
                  <Select value={coordinationStrategy} onValueChange={setCoordinationStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                      <SelectItem value="pipeline">Pipeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={executeCollaborativeTask} 
                  disabled={loading || !taskDescription.trim() || !collaborativeAgents.trim()}
                  className="w-full flex items-center gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  Execute Collaborative Task
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collaboration Result</CardTitle>
                <CardDescription>
                  Output from collaborative task execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collaborativeResult ? (
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-64">
                    {typeof collaborativeResult === 'string' ? collaborativeResult : JSON.stringify(collaborativeResult, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Execute a collaborative task to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="negotiation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Negotiation</CardTitle>
                <CardDescription>
                  Use FIPA Contract Net Protocol for agent negotiation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Initiator Agent</Label>
                  <Select value={negotiationInitiator} onValueChange={setNegotiationInitiator}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reasoning-assistant">Reasoning Assistant</SelectItem>
                      <SelectItem value="context-analyzer">Context Analyzer</SelectItem>
                      <SelectItem value="documentation-expert">Documentation Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Participant Agents (comma-separated)</Label>
                  <Input
                    placeholder="context-analyzer, documentation-expert"
                    value={negotiationParticipants}
                    onChange={(e) => setNegotiationParticipants(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Negotiation Task</Label>
                  <Textarea
                    placeholder="Describe the task to negotiate..."
                    value={negotiationTask}
                    onChange={(e) => setNegotiationTask(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={performNegotiation} 
                  disabled={loading || !negotiationTask.trim() || !negotiationParticipants.trim()}
                  className="w-full flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Start Negotiation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Negotiation Result</CardTitle>
                <CardDescription>
                  Contract Net Protocol negotiation outcome
                </CardDescription>
              </CardHeader>
              <CardContent>
                {negotiationResult ? (
                  <div className="space-y-4">
                    {negotiationResult.winner && (
                      <div>
                        <Label className="text-sm font-medium">Winner</Label>
                        <Badge className="ml-2">{negotiationResult.winner}</Badge>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium">Proposals ({negotiationResult.proposals.length})</Label>
                      <div className="space-y-2 mt-2">
                        {negotiationResult.proposals.map((proposal, index) => (
                          <div key={index} className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{proposal.sender.name}</Badge>
                              <Badge variant="secondary">{proposal.performative}</Badge>
                            </div>
                            <p className="text-sm">{proposal.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Start a negotiation to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};