
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const ActivityLogs: React.FC = () => {
  return (
    <Card className="card-nocodelos">
      <CardHeader>
        <CardTitle>Real-time Activity Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 text-sm">
                <span className="text-slate-400 text-xs">
                  {new Date(Date.now() - i * 5000).toLocaleTimeString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {i % 3 === 0 ? 'INFO' : i % 3 === 1 ? 'SUCCESS' : 'PROCESSING'}
                </Badge>
                <span className="text-slate-300">
                  Agent {['Reasoner', 'RAG', 'MCP', 'A2A'][i % 4]} {
                    ['started processing', 'completed task', 'retrieved data', 'coordinated with'][i % 4]
                  }
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityLogs;
