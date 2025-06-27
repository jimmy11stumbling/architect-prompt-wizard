
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";
import { WorkflowExecution } from "../types";

interface WorkflowOverviewProps {
  workflow: WorkflowExecution;
}

const WorkflowOverview: React.FC<WorkflowOverviewProps> = ({ workflow }) => {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  return (
    <Card className="card-nocodelos">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            {workflow.name}
          </CardTitle>
          <Badge variant="outline" className="text-blue-300 border-blue-400/30">
            {workflow.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-300">
              {workflow.currentStep}/{workflow.totalSteps}
            </div>
            <div className="text-sm text-slate-400">Steps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-300">
              {workflow.agents.filter(a => a.status === "completed").length}
            </div>
            <div className="text-sm text-slate-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">
              {workflow.agents.filter(a => a.status === "processing").length}
            </div>
            <div className="text-sm text-slate-400">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-300">
              {formatDuration(Date.now() - workflow.startTime)}
            </div>
            <div className="text-sm text-slate-400">Duration</div>
          </div>
        </div>
        <Progress 
          value={(workflow.currentStep / workflow.totalSteps) * 100} 
          className="h-2"
        />
      </CardContent>
    </Card>
  );
};

export default WorkflowOverview;
