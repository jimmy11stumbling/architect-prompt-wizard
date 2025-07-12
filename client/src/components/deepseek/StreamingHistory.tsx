import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Download, 
  Eye, 
  Clock,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Square
} from 'lucide-react';

interface StreamingSession {
  id: string;
  timestamp: Date;
  duration: number;
  totalTokens: number;
  reasoningTokens: number;
  responseTokens: number;
  averageThroughput: number;
  status: 'completed' | 'interrupted' | 'error';
  query: string;
  model: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface StreamingHistoryProps {
  sessions?: StreamingSession[];
  onSessionSelect?: (session: StreamingSession) => void;
  onExportSession?: (session: StreamingSession) => void;
  onClearHistory?: () => void;
}

export default function StreamingHistory({ 
  sessions = [], 
  onSessionSelect,
  onExportSession,
  onClearHistory 
}: StreamingHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'duration' | 'tokens'>('timestamp');

  // Generate mock sessions if none provided
  const mockSessions: StreamingSession[] = sessions.length > 0 ? sessions : [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      duration: 125,
      totalTokens: 1847,
      reasoningTokens: 623,
      responseTokens: 1224,
      averageThroughput: 14.8,
      status: 'completed',
      query: 'Create a React component for user authentication',
      model: 'deepseek-reasoner',
      quality: 'excellent'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      duration: 89,
      totalTokens: 1203,
      reasoningTokens: 401,
      responseTokens: 802,
      averageThroughput: 13.5,
      status: 'completed',
      query: 'Explain the Model Context Protocol implementation',
      model: 'deepseek-reasoner',
      quality: 'good'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      duration: 67,
      totalTokens: 945,
      reasoningTokens: 312,
      responseTokens: 633,
      averageThroughput: 14.1,
      status: 'interrupted',
      query: 'Design a RAG 2.0 architecture with vector search',
      model: 'deepseek-reasoner',
      quality: 'fair'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      duration: 156,
      totalTokens: 2234,
      reasoningTokens: 789,
      responseTokens: 1445,
      averageThroughput: 14.3,
      status: 'completed',
      query: 'Build a comprehensive AI agent workflow system',
      model: 'deepseek-reasoner',
      quality: 'excellent'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      duration: 43,
      totalTokens: 289,
      reasoningTokens: 97,
      responseTokens: 192,
      averageThroughput: 6.7,
      status: 'error',
      query: 'Implement database connection pooling',
      model: 'deepseek-reasoner',
      quality: 'poor'
    }
  ];

  const filteredSessions = mockSessions
    .filter(session => {
      const matchesSearch = session.query.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'tokens':
          return b.totalTokens - a.totalTokens;
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'interrupted':
        return <Square className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'interrupted':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  const totalSessions = mockSessions.length;
  const completedSessions = mockSessions.filter(s => s.status === 'completed').length;
  const totalTokens = mockSessions.reduce((sum, s) => sum + s.totalTokens, 0);
  const averageThroughput = mockSessions.reduce((sum, s) => sum + s.averageThroughput, 0) / mockSessions.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Streaming History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClearHistory}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{totalSessions}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedSessions}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{totalTokens.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Tokens</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{averageThroughput.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Avg Throughput</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="interrupted">Interrupted</option>
              <option value="error">Error</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Sort by Time</option>
              <option value="duration">Sort by Duration</option>
              <option value="tokens">Sort by Tokens</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div 
                key={session.id} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSessionSelect?.(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(session.status)}
                      <span className="font-medium text-sm">{session.query}</span>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Duration:</span> {formatDuration(session.duration)}
                      </div>
                      <div>
                        <span className="font-medium">Tokens:</span> {session.totalTokens.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Throughput:</span> {session.averageThroughput.toFixed(1)} t/s
                      </div>
                      <div>
                        <span className="font-medium">Quality:</span> 
                        <span className={`ml-1 ${getQualityColor(session.quality)}`}>
                          {session.quality}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-gray-500">{formatTimestamp(session.timestamp)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionSelect?.(session);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportSession?.(session);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No streaming sessions found</p>
              <p className="text-sm">Sessions will appear here after you start streaming</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}