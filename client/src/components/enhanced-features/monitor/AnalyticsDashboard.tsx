
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseData {
  id: string;
  source: string;
  status: 'success' | 'error' | 'processing';
  message: string;
  timestamp: number;
}

interface AnalyticsDashboardProps {
  responses: ResponseData[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ responses }) => {
  const successCount = responses.filter(r => r.status === 'success').length;
  const errorCount = responses.filter(r => r.status === 'error').length;
  const processingCount = responses.filter(r => r.status === 'processing').length;

  return (
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
            <div className="text-3xl font-bold text-green-500">{successCount}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{errorCount}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500">{processingCount}</div>
            <div className="text-sm text-muted-foreground">Processing</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
