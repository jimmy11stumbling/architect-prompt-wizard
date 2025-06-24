
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Bot, 
  Brain, 
  Database, 
  Network, 
  Settings, 
  Zap,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";
import AgentResponseValidator from "./AgentResponseValidator";
import { AgentName } from "@/types/ipa-types";

const LiveAgentMonitor: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentName | null>(null);
  const [responses, setResponses] = useState<any[]>([]);

  const agents: AgentName[] = [
    "RequirementDecompositionAgent",
    "RAGContextIntegrationAgent",
    "A2AProtocolExpertAgent",
    "TechStackImplementationAgent_Frontend",
    "TechStackImplementationAgent_Backend",
    "CursorOptimizationAgent",
    "QualityAssuranceAgent"
  ];

  const systemServices = [
    { name: "RAG 2.0", icon: Database, status: "active", color: "text-green-500" },
    { name: "A2A Protocol", icon: Network, status: "active", color: "text-blue-500" },
    { name: "MCP Hub", icon: Settings, status: "active", color: "text-purple-500" },
    { name: "DeepSeek Reasoner", icon: Brain, status: "active", color: "text-orange-500" }
  ];

  const fetchLiveData = () => {
    const allResponses = realTimeResponseService.getResponses();
    setResponses(allResponses.slice(-50).reverse());
  };

  const clearLogs = () => {
    realTimeResponseService.clearResponses();
    setResponses([]);
  };

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  useEffect(() => {
    if (isLive) {
      fetchLiveData();
      const interval = setInterval(fetchLiveData, 500); // Very frequent updates
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Add real-time console logging for validation
  useEffect(() => {
    const logInterval = setInterval(() => {
      if (responses.length > 0) {
        const latestResponse = responses[0];
        console.log(`🔍 LIVE VALIDATION: [${latestResponse.source}] ${latestResponse.status.toUpperCase()} - ${latestResponse.message}`);
        
        if (latestResponse.data) {
          console.log(`📊 VALIDATION DATA:`, latestResponse.data);
        }
      }
    }, 2000);

    return () => clearInterval(logInterval);
  }, [responses]);

  return (
    <div className="space-y-6">
      {/* Live Monitor Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`h-5 w-5 ${isLive ? "animate-pulse text-green-500" : "text-gray-500"}`} />
              Live Agent Monitor
              {isLive && <Badge variant="outline" className="text-green-500">LIVE</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleLive}
                variant={isLive ? "destructive" : "default"}
                size="sm"
              >
                {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isLive ? "Pause" : "Resume"}
              </Button>
              <Button onClick={clearLogs} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemServices.map((service) => (
              <div key={service.name} className="flex items-center gap-2 p-2 border rounded">
                <service.icon className={`h-4 w-4 ${service.color}`} />
                <span className="text-sm font-medium">{service.name}</span>
                <div className={`w-2 h-2 rounded-full ${service.status === 'active' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedAgent(null)}
              variant={selectedAgent === null ? "default" : "outline"}
              size="sm"
            >
              All Agents
            </Button>
            {agents.map((agent) => (
              <Button
                key={agent}
                onClick={() => setSelectedAgent(agent)}
                variant={selectedAgent === agent ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                {agent.replace("Agent", "").replace("TechStackImplementation", "TechStack")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Monitoring Tabs */}
      <Tabs defaultValue="validator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="validator">Response Validator</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="validator">
          <AgentResponseValidator 
            agentName={selectedAgent || undefined}
            showAllAgents={selectedAgent === null}
          />
        </TabsContent>

        <TabsContent value="realtime">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Real-time Response Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {responses.map((response, index) => (
                  <div 
                    key={response.id} 
                    className={`p-3 border rounded ${
                      index === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{response.source}</span>
                        <Badge variant={response.status === 'success' ? 'default' : 
                                      response.status === 'error' ? 'destructive' : 'secondary'}>
                          {response.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{response.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Live Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{responses.length}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">
                    {responses.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">
                    {responses.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {responses.filter(r => r.status === 'processing').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveAgentMonitor;
