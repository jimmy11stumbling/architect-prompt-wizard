
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, Clock, Bot } from "lucide-react";
import { realTimeResponseService, RealTimeResponse } from "@/services/integration/realTimeResponseService";
import { AgentName } from "@/types/ipa-types";

interface AgentResponseValidatorProps {
  agentName?: AgentName;
  showAllAgents?: boolean;
}

const AgentResponseValidator: React.FC<AgentResponseValidatorProps> = ({ 
  agentName, 
  showAllAgents = false 
}) => {
  const [responses, setResponses] = useState<RealTimeResponse[]>([]);
  const [validationStats, setValidationStats] = useState({
    total: 0,
    success: 0,
    error: 0,
    processing: 0,
    validation: 0
  });

  const fetchResponses = () => {
    const allResponses = realTimeResponseService.getResponses();
    
    let filteredResponses = allResponses;
    if (!showAllAgents && agentName) {
      filteredResponses = allResponses.filter(r => 
        r.source.toLowerCase().includes(agentName.toLowerCase()) ||
        r.message.toLowerCase().includes(agentName.toLowerCase())
      );
    }

    setResponses(filteredResponses.slice(-20).reverse()); // Show last 20 responses

    // Calculate stats
    const stats = filteredResponses.reduce((acc, response) => {
      acc.total++;
      acc[response.status]++;
      return acc;
    }, { total: 0, success: 0, error: 0, processing: 0, validation: 0 });

    setValidationStats(stats);
  };

  useEffect(() => {
    fetchResponses();
    const interval = setInterval(fetchResponses, 1000); // Update every second
    return () => clearInterval(interval);
  }, [agentName, showAllAgents]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing": return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "validation": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "border-l-green-500 bg-green-50";
      case "error": return "border-l-red-500 bg-red-50";
      case "processing": return "border-l-blue-500 bg-blue-50";
      case "validation": return "border-l-yellow-500 bg-yellow-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  const successRate = validationStats.total > 0 
    ? Math.round((validationStats.success / validationStats.total) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {showAllAgents ? "All Agents" : agentName || "Agent"} Response Validator
        </CardTitle>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{validationStats.success}</div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{validationStats.error}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{validationStats.processing}</div>
            <div className="text-xs text-muted-foreground">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>
        <Progress value={successRate} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {responses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No agent responses yet</p>
              <p className="text-sm">Responses will appear here in real-time</p>
            </div>
          ) : (
            responses.map((response) => (
              <div
                key={response.id}
                className={`border-l-4 p-3 rounded-r ${getStatusColor(response.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(response.status)}
                      <span className="text-sm font-medium">{response.source}</span>
                      <Badge variant="outline" className="text-xs">
                        {response.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">{response.message}</p>
                    
                    {response.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Validation Details
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentResponseValidator;
