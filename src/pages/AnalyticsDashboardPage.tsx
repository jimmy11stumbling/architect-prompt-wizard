
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Database,
  Network,
  Activity,
  Download,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  overview: {
    totalPrompts: number;
    successRate: number;
    avgProcessingTime: number;
    activeUsers: number;
  };
  usage: {
    daily: Array<{ date: string; prompts: number; success: number; }>;
    agentPerformance: Array<{ name: string; success: number; avg_time: number; total: number; }>;
    modelUsage: Array<{ name: string; value: number; }>;
  };
  system: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  };
}

const AnalyticsDashboardPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalyticsData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
      overview: {
        totalPrompts: 1247,
        successRate: 94.2,
        avgProcessingTime: 8.5,
        activeUsers: 156
      },
      usage: {
        daily: [
          { date: "2024-01-01", prompts: 45, success: 42 },
          { date: "2024-01-02", prompts: 67, success: 63 },
          { date: "2024-01-03", prompts: 89, success: 85 },
          { date: "2024-01-04", prompts: 123, success: 118 },
          { date: "2024-01-05", prompts: 156, success: 148 },
          { date: "2024-01-06", prompts: 178, success: 169 },
          { date: "2024-01-07", prompts: 201, success: 189 }
        ],
        agentPerformance: [
          { name: "DeepSeek Reasoner", success: 96, avg_time: 3.2, total: 456 },
          { name: "RAG Retriever", success: 94, avg_time: 2.1, total: 389 },
          { name: "MCP Executor", success: 92, avg_time: 1.8, total: 234 },
          { name: "A2A Coordinator", success: 91, avg_time: 2.5, total: 168 }
        ],
        modelUsage: [
          { name: "DeepSeek v3", value: 45 },
          { name: "GPT-4", value: 28 },
          { name: "Claude 3.5", value: 18 },
          { name: "Others", value: 9 }
        ]
      },
      system: {
        cpu: 68,
        memory: 72,
        requests: 1834,
        errors: 12
      }
    };
    
    setAnalyticsData(mockData);
    setLoading(false);
    setLastUpdated(new Date());
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading || !analyticsData) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-nocodelos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Prompts</p>
                <p className="text-2xl font-bold text-blue-300">
                  {analyticsData.overview.totalPrompts.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-sm text-green-400">+12.5%</span>
              <span className="text-sm text-slate-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-nocodelos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-300">
                  {analyticsData.overview.successRate}%
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-sm text-green-400">+2.1%</span>
              <span className="text-sm text-slate-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-nocodelos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Processing Time</p>
                <p className="text-2xl font-bold text-purple-300">
                  {analyticsData.overview.avgProcessingTime}s
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-red-400 mr-1 rotate-180" />
              <span className="text-sm text-red-400">-0.8s</span>
              <span className="text-sm text-slate-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-nocodelos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Users</p>
                <p className="text-2xl font-bold text-orange-300">
                  {analyticsData.overview.activeUsers}
                </p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-full">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-sm text-green-400">+18.2%</span>
              <span className="text-sm text-slate-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle>Daily Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.usage.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="prompts" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Total Prompts"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="success" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Successful"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle>Model Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.usage.modelUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.usage.modelUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle>Agent Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.usage.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="success" fill="#10b981" name="Success Rate %" />
                  <Bar dataKey="avg_time" fill="#3b82f6" name="Avg Time (s)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData.usage.agentPerformance.map((agent, index) => (
              <Card key={agent.name} className="card-nocodelos">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>{agent.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {agent.total} tasks
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Success Rate</span>
                        <span>{agent.success}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full"
                          style={{ width: `${agent.success}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Processing Time</span>
                      <span>{agent.avg_time}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Tasks</span>
                      <span>{agent.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-nocodelos">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">CPU Usage</p>
                    <p className="text-2xl font-bold text-blue-300">
                      {analyticsData.system.cpu}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: `${analyticsData.system.cpu}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-nocodelos">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Memory Usage</p>
                    <p className="text-2xl font-bold text-purple-300">
                      {analyticsData.system.memory}%
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-purple-400" />
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full"
                    style={{ width: `${analyticsData.system.memory}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-nocodelos">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Requests</p>
                    <p className="text-2xl font-bold text-green-300">
                      {analyticsData.system.requests.toLocaleString()}
                    </p>
                  </div>
                  <Network className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-sm text-slate-400 mt-2">Today</p>
              </CardContent>
            </Card>

            <Card className="card-nocodelos">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Errors</p>
                    <p className="text-2xl font-bold text-red-300">
                      {analyticsData.system.errors}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-sm text-slate-400 mt-2">Last 24h</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-300">Performance Improvement</h4>
                    <p className="text-sm text-slate-300">
                      Average processing time decreased by 15% this week
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-300">High Success Rate</h4>
                    <p className="text-sm text-slate-300">
                      94.2% success rate maintained across all agents
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-300">User Growth</h4>
                    <p className="text-sm text-slate-300">
                      18% increase in active users this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-nocodelos">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-300">Scale RAG Service</h4>
                    <p className="text-sm text-slate-300">
                      Consider increasing RAG service capacity for peak hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
                  <Database className="h-5 w-5 text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-300">Cache Optimization</h4>
                    <p className="text-sm text-slate-300">
                      Implement caching for frequently requested prompts
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-300">Monitor Errors</h4>
                    <p className="text-sm text-slate-300">
                      Set up alerts for error rate exceeding 5%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboardPage;
