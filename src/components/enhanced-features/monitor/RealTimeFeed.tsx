
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface ResponseData {
  id: string;
  source: string;
  status: 'success' | 'error' | 'processing';
  message: string;
  timestamp: number;
}

interface RealTimeFeedProps {
  responses: ResponseData[];
}

const RealTimeFeed: React.FC<RealTimeFeedProps> = ({ responses }) => {
  return (
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
  );
};

export default RealTimeFeed;
