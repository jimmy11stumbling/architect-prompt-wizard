import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  MessageSquare, 
  Network, 
  Activity, 
  Send,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bot
} from 'lucide-react';
import { 
  a2aSystem, 
  AgentRegistration, 
  ACLMessage, 
  TaskAnnouncement, 
  Bid,
  ACLPerformative 
} from '@/services/a2a/agentCommunicationSystem';

interface A2AInterfaceProps {
  onAgentSelect?: (agent: AgentRegistration) => void;
}

interface SystemStats {
  totalAgents: number;
  activeAgents: number;
  totalCapabilities: number;
  activeConversations: number;
  averageLoad: number;
}

export default function A2AInterface({ onAgentSelect }: A2AInterfaceProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [agents, setAgents] = useState<AgentRegistration[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Message composition
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<ACLPerformative>('inform');
  const [receiverAgent, setReceiverAgent] = useState<string>('');

  // Task announcement
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCapabilities, setTaskCapabilities] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [isAnnouncingTask, setIsAnnouncingTask] = useState(false);

  useEffect(() => {
    initializeA2ASystem();
  }, []);

  const initializeA2ASystem = async () => {
    if (isInitialized) return;
    
    setIsInitializing(true);
    setError(null);

    try {
      // Initialize A2A system
      await a2aSystem.initialize();
      
      // Get initial stats and agents
      updateSystemStats();
      updateAgentList();
      
      setIsInitialized(true);
      console.log('A2A system initialized successfully');
      
      // Set up periodic updates
      const interval = setInterval(() => {
        if (isInitialized) {
          updateSystemStats();
          updateAgentList();
        }
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize A2A system';
      setError(errorMessage);
      console.error('A2A initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const updateSystemStats = () => {
    try {
      const stats = a2aSystem.getSystemStats();
      setSystemStats(stats);
    } catch (err) {
      console.error('Failed to update system stats:', err);
    }
  };

  const updateAgentList = () => {
    try {
      const allAgents = a2aSystem.directory.getAllAgents();
      setAgents(allAgents);
    } catch (err) {
      console.error('Failed to update agent list:', err);
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !receiverAgent) return;

    try {
      const receiver = agents.find(agent => agent.identifier.name === receiverAgent);
      if (!receiver) {
        setError('Receiver agent not found');
        return;
      }

      const message: ACLMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        performative: messageType,
        sender: {
          name: 'user-interface',
          addresses: ['local://user-interface']
        },
        receivers: [receiver.identifier],
        content: {
          type: 'text',
          data: messageContent
        },
        language: 'text',
        encoding: 'utf-8',
        timestamp: new Date()
      };

      const results = await a2aSystem.sendMessage(message);
      const success = results.every(result => result);

      if (success) {
        setMessageContent('');
        console.log('Message sent successfully');
      } else {
        setError('Failed to send message to some recipients');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    }
  };

  const announceTask = async () => {
    if (!taskDescription.trim() || !taskCapabilities.trim()) return;

    setIsAnnouncingTask(true);
    setError(null);

    try {
      const deadline = taskDeadline ? new Date(taskDeadline) : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default
      
      const task: TaskAnnouncement = {
        taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: taskDescription,
        requirements: {
          capabilities: taskCapabilities.split(',').map(c => c.trim()),
          constraints: [],
          deadline: deadline
        },
        evaluationCriteria: {
          cost: 0.3,
          quality: 0.4,
          time: 0.2,
          reliability: 0.1
        }
      };

      const taskId = await a2aSystem.contractNetProtocol.announceTask(task, {
        name: 'user-interface',
        addresses: ['local://user-interface']
      });

      console.log(`Task announced with ID: ${taskId}`);
      setTaskDescription('');
      setTaskCapabilities('');
      setTaskDeadline('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to announce task';
      setError(errorMessage);
    } finally {
      setIsAnnouncingTask(false);
    }
  };

  const handleAgentSelect = (agent: AgentRegistration) => {
    setSelectedAgent(agent);
    onAgentSelect?.(agent);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLoad = (load: number) => {
    return `${Math.round(load * 100)}%`;
  };

  if (isInitializing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            A2A Communication System
          </CardTitle>
          <CardDescription>
            Initializing agent-to-agent communication protocol...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-sm text-muted-foreground">
                Setting up FIPA ACL protocol and agent registry...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            A2A System Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={initializeA2ASystem} 
            className="mt-4"
            disabled={isInitializing}
          >
            {isInitializing ? 'Retrying...' : 'Retry Initialization'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            A2A Communication System
            {isInitialized && (
              <Badge variant="secondary" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Multi-agent coordination using FIPA ACL protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemStats.totalAgents}</div>
                <div className="text-sm text-muted-foreground">Total Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemStats.activeAgents}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemStats.totalCapabilities}</div>
                <div className="text-sm text-muted-foreground">Capabilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemStats.activeConversations}</div>
                <div className="text-sm text-muted-foreground">Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatLoad(systemStats.averageLoad)}</div>
                <div className="text-sm text-muted-foreground">Avg Load</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agent Directory</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="tasks">Task Coordination</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registered Agents
              </CardTitle>
              <CardDescription>
                Browse and interact with available agents in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <Card 
                    key={agent.identifier.name} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleAgentSelect(agent)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <h3 className="font-semibold">{agent.identifier.name}</h3>
                            <Badge className={getStatusColor(agent.status)}>
                              {agent.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((capability, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {capability.name}
                              </Badge>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{agent.capabilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <div>Services: {agent.services.join(', ')}</div>
                            <div>Protocols: {agent.protocols.join(', ')}</div>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">
                            Load: {formatLoad(agent.load)}
                          </div>
                          <Progress value={agent.load * 100} className="w-16 h-2" />
                          <div className="text-xs text-muted-foreground">
                            v{agent.metadata.version}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {agents.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No agents registered in the system.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Direct Messaging
              </CardTitle>
              <CardDescription>
                Send messages directly to agents using FIPA ACL protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Receiver Agent</label>
                  <Select value={receiverAgent} onValueChange={setReceiverAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.filter(agent => agent.status === 'active').map((agent) => (
                        <SelectItem key={agent.identifier.name} value={agent.identifier.name}>
                          {agent.identifier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Type</label>
                  <Select value={messageType} onValueChange={(value) => setMessageType(value as ACLPerformative)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inform">Inform</SelectItem>
                      <SelectItem value="request">Request</SelectItem>
                      <SelectItem value="query-if">Query If</SelectItem>
                      <SelectItem value="query-ref">Query Reference</SelectItem>
                      <SelectItem value="propose">Propose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Content</label>
                <Textarea
                  placeholder="Enter your message content..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={sendMessage}
                disabled={!messageContent.trim() || !receiverAgent}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Task Coordination
              </CardTitle>
              <CardDescription>
                Announce tasks using Contract Net Protocol for agent bidding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Description</label>
                <Textarea
                  placeholder="Describe the task you want to announce..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Required Capabilities</label>
                  <Input
                    placeholder="e.g., logical-reasoning, context-analysis"
                    value={taskCapabilities}
                    onChange={(e) => setTaskCapabilities(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of required capabilities
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deadline (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={announceTask}
                disabled={!taskDescription.trim() || !taskCapabilities.trim() || isAnnouncingTask}
                className="w-full"
              >
                {isAnnouncingTask ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Announcing Task...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Announce Task
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Details: {selectedAgent.identifier.name}</CardTitle>
            <CardDescription>
              Detailed information about the selected agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> 
                  <Badge className={`ml-2 ${getStatusColor(selectedAgent.status)}`}>
                    {selectedAgent.status}
                  </Badge>
                </div>
                <div>
                  <strong>Load:</strong> {formatLoad(selectedAgent.load)}
                </div>
                <div>
                  <strong>Version:</strong> {selectedAgent.metadata.version}
                </div>
                <div>
                  <strong>Last Heartbeat:</strong> {selectedAgent.lastHeartbeat.toLocaleTimeString()}
                </div>
              </div>
              
              <div>
                <strong>Capabilities:</strong>
                <div className="mt-2 space-y-2">
                  {selectedAgent.capabilities.map((capability, index) => (
                    <div key={index} className="p-3 bg-muted rounded text-sm">
                      <div className="font-medium">{capability.name}</div>
                      <div className="text-muted-foreground text-xs mt-1">{capability.description}</div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <div>Cost: {capability.cost}</div>
                        <div>Reliability: {(capability.reliability * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <strong>Addresses:</strong>
                <div className="mt-1 space-y-1">
                  {selectedAgent.identifier.addresses.map((address, index) => (
                    <Badge key={index} variant="outline" className="text-xs mr-1">
                      {address}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}