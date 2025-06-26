
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Pause,
  Play,
  RotateCcw
} from "lucide-react";
import { useLiveMonitoring } from "./hooks/useLiveMonitoring";
import AgentResponseValidator from "./AgentResponseValidator";
import SystemStatusGrid from "./monitor/SystemStatusGrid";
import AgentSelector from "./monitor/AgentSelector";
import RealTimeFeed from "./monitor/RealTimeFeed";
import AnalyticsDashboard from "./monitor/AnalyticsDashboard";

const LiveAgentMonitor: React.FC = () => {
  const {
    isLive,
    selectedAgent,
    setSelectedAgent,
    responses,
    agents,
    systemServices,
    toggleLive,
    clearLogs
  } = useLiveMonitoring();

  return (
    <div className="space-y-6">
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
          <SystemStatusGrid services={systemServices} />
        </CardContent>
      </Card>

      <AgentSelector
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />

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
          <RealTimeFeed responses={responses} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard responses={responses} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveAgentMonitor;
