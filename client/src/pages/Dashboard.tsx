
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Zap, 
  Database, 
  Network, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  Settings,
  Eye
} from "lucide-react";
import AgentOrchestrationDashboard from "@/components/orchestration/AgentOrchestrationDashboard";
import AdvancedTemplateSystem from "@/components/templates/AdvancedTemplateSystem";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { label: "Total Projects", value: "1,247", icon: Activity, color: "text-blue-400" },
    { label: "Active Agents", value: "8", icon: Users, color: "text-green-400" },
    { label: "Success Rate", value: "94.2%", icon: TrendingUp, color: "text-purple-400" },
    { label: "Avg Response", value: "2.3s", icon: Clock, color: "text-orange-400" }
  ];

  const recentActivity = [
    { time: "2 min ago", action: "Prompt generated", project: "E-commerce Platform", status: "success" },
    { time: "5 min ago", action: "Template used", project: "SaaS Starter", status: "success" },
    { time: "8 min ago", action: "RAG query executed", project: "AI Agent Marketplace", status: "success" },
    { time: "12 min ago", action: "A2A coordination", project: "Mobile App", status: "processing" },
    { time: "15 min ago", action: "MCP tool executed", project: "Enterprise Solution", status: "success" }
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">System Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Real-time overview of your AI development environment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button className="btn-nocodelos">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="card-nocodelos">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 bg-slate-700/50 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orchestration">Agent Orchestration</TabsTrigger>
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Status */}
            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">DeepSeek Reasoner</span>
                  <Badge variant="outline" className="text-green-300 border-green-400/30">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">RAG 2.0 Database</span>
                  <Badge variant="outline" className="text-green-300 border-green-400/30">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">A2A Protocol</span>
                  <Badge variant="outline" className="text-green-300 border-green-400/30">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">MCP Hub</span>
                  <Badge variant="outline" className="text-green-300 border-green-400/30">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Workflow Engine</span>
                  <Badge variant="outline" className="text-green-300 border-green-400/30">
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Prompt
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Query RAG Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Network className="h-4 w-4 mr-2" />
                  Coordinate Agents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Templates
                </Button>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-400" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span>32%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orchestration">
          <AgentOrchestrationDashboard />
        </TabsContent>

        <TabsContent value="templates">
          <AdvancedTemplateSystem />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-slate-400">{activity.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          activity.status === 'success' 
                            ? 'text-green-300 border-green-400/30'
                            : activity.status === 'processing'
                            ? 'text-yellow-300 border-yellow-400/30'
                            : 'text-red-300 border-red-400/30'
                        }`}
                      >
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
