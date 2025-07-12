import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, MessageSquare, Activity, Zap } from 'lucide-react';

interface StreamingFeedbackProps {
  active: boolean;
  stage: 'connecting' | 'reasoning' | 'responding';
  reasoningTokens: number;
  responseTokens: number;
}

export default function StreamingFeedback({
  active,
  stage,
  reasoningTokens,
  responseTokens
}: StreamingFeedbackProps) {
  if (!active) return null;

  const getStageInfo = () => {
    switch (stage) {
      case 'connecting':
        return {
          icon: Activity,
          label: 'Establishing Connection',
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/50',
          progress: 25
        };
      case 'reasoning':
        return {
          icon: Brain,
          label: 'Deep Reasoning in Progress',
          color: 'text-orange-400',
          bgColor: 'bg-orange-900/20',
          borderColor: 'border-orange-500/50',
          progress: 60
        };
      case 'responding':
        return {
          icon: MessageSquare,
          label: 'Generating Response',
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/50',
          progress: 90
        };
      default:
        return {
          icon: Activity,
          label: 'Processing',
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-500/50',
          progress: 0
        };
    }
  };

  const stageInfo = getStageInfo();
  const Icon = stageInfo.icon;

  return (
    <Card className={`${stageInfo.bgColor} ${stageInfo.borderColor} shadow-lg`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Icon className={`h-8 w-8 ${stageInfo.color} animate-pulse`} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${stageInfo.color}`}>
                {stageInfo.label}
              </span>
              <Badge variant="outline" className={`${stageInfo.color} border-current`}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </Badge>
            </div>

            <Progress value={stageInfo.progress} className="h-2 mb-3" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-orange-400" />
                <span className="text-gray-300">Reasoning:</span>
                <span className="font-mono text-orange-400">{reasoningTokens}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Response:</span>
                <span className="font-mono text-green-400">{responseTokens}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}