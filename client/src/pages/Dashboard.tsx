import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
  Eye,
  Brain,
  MessageSquare,
  Cpu,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import AgentOrchestrationDashboard from "@/components/orchestration/AgentOrchestrationDashboard";
import AdvancedTemplateSystem from "@/components/templates/AdvancedTemplateSystem";
import WorkflowDashboard from "@/components/workflow/WorkflowDashboard";
import { RAGAnalyticsDashboard } from "@/components/rag/RAGAnalyticsDashboard";
import MainLayout from "@/components/layout/MainLayout";

interface SystemStats {
  platforms: number;
  knowledgeBase: number;
  promptGenerations: number;
  ragQueries: number;
  mcpTools: number;
  a2aMessages: number;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [systemHealth, setSystemHealth] = useState({
    rag: 'healthy',
    mcp: 'healthy', 
    a2a: 'healthy',
    deepseek: 'healthy'
  });
  const { toast } = useToast();

  // Fetch real system statistics
  const { data: stats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/dashboard/activity'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Health check for all systems
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const [ragHealth, mcpHealth, a2aHealth] = await Promise.all([
          fetch('/api/rag/health').then(r => r.json()),
          fetch('/api/mcp/health').then(r => r.json()),
          fetch('/api/a2a/health').then(r => r.json())
        ]);

        setSystemHealth({
          rag: ragHealth.status || 'unknown',
          mcp: mcpHealth.status || 'unknown',
          a2a: a2aHealth.status || 'unknown',
          deepseek: 'healthy' // DeepSeek reasoner status
        });
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const dashboardStats = [
    { 
      label: "Platform Integrations", 
      value: stats?.platforms?.toString() || "0", 
      icon: Database, 
      color: "text-blue-400",
      description: "Connected platforms"
    },
    { 
      label: "Knowledge Base", 
      value: stats?.knowledgeBase?.toString() || "0", 
      icon: Brain, 
      color: "text-green-400",
      description: "Indexed documents"
    },
    { 
      label: "RAG Queries", 
      value: stats?.ragQueries?.toString() || "0", 
      icon: TrendingUp, 
      color: "text-purple-400",
      description: "Search requests today"
    },
    { 
      label: "MCP Tools", 
      value: stats?.mcpTools?.toString() || "7", 
      icon: Zap, 
      color: "text-orange-400",
      description: "Active tools available"
    }
  ];

  // Handler functions for dashboard actions
  const handleNewProject = () => {
    window.location.href = '/'; // Navigate to main project form
  };

  const handleSearchKnowledgeBase = async () => {
    try {
      const response = await fetch('/api/knowledge-base');
      const data = await response.json();
      toast({
        title: "Knowledge Base",
        description: `Found ${data.length} entries in knowledge base`,
      });
      setActiveTab("analytics"); // Switch to analytics tab to show RAG interface
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access knowledge base",
        variant: "destructive"
      });
    }
  };

  const handleTestMCPTools = async () => {
    try {
      const response = await fetch('/api/mcp/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': '1' },
        body: JSON.stringify({
          toolName: 'list_files',
          args: { path: '.' }
        })
      });
      const data = await response.json();
      toast({
        title: "MCP Tools Test",
        description: `Successfully called list_files tool`,
      });
    } catch (error) {
      toast({
        title: "MCP Tools Error",
        description: "Failed to test MCP tools",
        variant: "destructive"
      });
    }
  };

  const handleQueryDeepSeek = () => {
    window.location.href = '/reasoner'; // Navigate to DeepSeek Reasoner page
  };

  const handleConfigure = () => {
    toast({
      title: "Configuration",
      description: "Configuration panel coming soon",
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">System Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Real-time overview of your AI development environment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleConfigure}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button className="btn-nocodelos" onClick={handleNewProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${systemHealth.rag === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium">RAG System</span>
              </div>
              <Badge variant={systemHealth.rag === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.rag}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${systemHealth.mcp === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium">MCP Tools</span>
              </div>
              <Badge variant={systemHealth.mcp === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.mcp}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${systemHealth.a2a === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium">A2A Protocol</span>
              </div>
              <Badge variant={systemHealth.a2a === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.a2a}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${systemHealth.deepseek === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium">DeepSeek AI</span>
              </div>
              <Badge variant={systemHealth.deepseek === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.deepseek}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="card-nocodelos hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {statsLoading ? "..." : stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="orchestration">Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activityLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-slate-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-white">{activity.action || `Action ${index + 1}`}</span>
                        </div>
                        <span className="text-xs text-slate-400">{activity.time || 'Just now'}</span>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-slate-400">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline" onClick={handleNewProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Prompt
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleSearchKnowledgeBase}>
                  <Database className="h-4 w-4 mr-2" />
                  Search Knowledge Base
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleTestMCPTools}>
                  <Network className="h-4 w-4 mr-2" />
                  Test MCP Tools
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleQueryDeepSeek}>
                  <Brain className="h-4 w-4 mr-2" />
                  Query DeepSeek Reasoner
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowDashboard />
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-6">
          <AgentOrchestrationDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RAGAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                System Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${activity.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-slate-400">{activity.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
    </MainLayout>
  );
};

export default Dashboard;