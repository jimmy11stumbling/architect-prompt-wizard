import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock, 
  Search,
  Database,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface PerformanceMetrics {
  avgSearchTime: number;
  avgRelevanceScore: number;
  totalQueries: number;
  queriesPerHour: number;
  popularQueries: Array<{ query: string; count: number }>;
  failureRate: number;
  indexingStatus: {
    totalDocuments: number;
    lastIndexed: string | null;
    avgChunkSize: number;
  };
}

interface QueryPattern {
  commonTerms: Array<{ term: string; frequency: number }>;
  queryComplexity: { simple: number; medium: number; complex: number };
  temporalPatterns: Array<{ hour: number; count: number }>;
}

export const RAGAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [patterns, setPatterns] = useState<QueryPattern | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [metricsRes, patternsRes] = await Promise.all([
        fetch("/api/rag/analytics/metrics"),
        fetch("/api/rag/analytics/patterns")
      ]);

      if (metricsRes.ok && patternsRes.ok) {
        setMetrics(await metricsRes.json());
        setPatterns(await patternsRes.json());
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics || !patterns) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const complexityTotal = patterns.queryComplexity.simple + 
                         patterns.queryComplexity.medium + 
                         patterns.queryComplexity.complex;

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Search Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgSearchTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgSearchTime < 100 ? "Excellent" : metrics.avgSearchTime < 300 ? "Good" : "Needs optimization"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relevance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.avgRelevanceScore * 100).toFixed(1)}%</div>
            <Progress value={metrics.avgRelevanceScore * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries/Hour</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.queriesPerHour.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Total: {metrics.totalQueries} queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            {metrics.failureRate < 0.1 ? 
              <CheckCircle className="h-4 w-4 text-green-600" /> : 
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            }
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((1 - metrics.failureRate) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {(metrics.failureRate * 100).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="queries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queries">Query Analytics</TabsTrigger>
          <TabsTrigger value="indexing">Indexing Status</TabsTrigger>
          <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="queries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Popular Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Popular Queries
                </CardTitle>
                <CardDescription>
                  Most frequent searches in the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {metrics.popularQueries.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm truncate flex-1">{item.query}</span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Query Complexity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Query Complexity
                </CardTitle>
                <CardDescription>
                  Distribution of query types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Simple (1-3 words)</span>
                      <span className="text-sm">{patterns.queryComplexity.simple}</span>
                    </div>
                    <Progress 
                      value={(patterns.queryComplexity.simple / complexityTotal) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Medium (4-7 words)</span>
                      <span className="text-sm">{patterns.queryComplexity.medium}</span>
                    </div>
                    <Progress 
                      value={(patterns.queryComplexity.medium / complexityTotal) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Complex (8+ words)</span>
                      <span className="text-sm">{patterns.queryComplexity.complex}</span>
                    </div>
                    <Progress 
                      value={(patterns.queryComplexity.complex / complexityTotal) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Common Search Terms</CardTitle>
              <CardDescription>
                Most frequently used words in queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patterns.commonTerms.slice(0, 20).map((term, index) => (
                  <Badge 
                    key={index} 
                    variant={index < 5 ? "default" : "secondary"}
                    className="px-3 py-1"
                  >
                    {term.term} ({term.frequency})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Indexing Status
              </CardTitle>
              <CardDescription>
                Current state of the vector database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Documents</div>
                  <div className="text-2xl font-bold">{metrics.indexingStatus.totalDocuments}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average Chunk Size</div>
                  <div className="text-2xl font-bold">{metrics.indexingStatus.avgChunkSize} chars</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Indexed</div>
                  <div className="text-sm">
                    {metrics.indexingStatus.lastIndexed 
                      ? new Date(metrics.indexingStatus.lastIndexed).toLocaleString()
                      : "Never"
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temporal Usage Patterns</CardTitle>
              <CardDescription>
                Query volume by hour of day (last 7 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patterns.temporalPatterns.map((pattern) => (
                  <div key={pattern.hour} className="flex items-center gap-2">
                    <span className="text-sm w-16">{pattern.hour}:00</span>
                    <div className="flex-1">
                      <Progress 
                        value={(pattern.count / Math.max(...patterns.temporalPatterns.map(p => p.count))) * 100} 
                        className="h-4"
                      />
                    </div>
                    <span className="text-sm w-12 text-right">{pattern.count}</span>
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