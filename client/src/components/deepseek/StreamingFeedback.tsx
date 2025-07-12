
import React from 'react';
import { Brain, Zap, Clock, Activity, Cpu, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StreamingFeedbackProps {
  active: boolean;
  stage?: 'connecting' | 'reasoning' | 'responding';
  reasoningTokens?: number;
  responseTokens?: number;
}

export default function StreamingFeedback({ 
  active, 
  stage = 'connecting', 
  reasoningTokens = 0, 
  responseTokens = 0 
}: StreamingFeedbackProps) {
  // Always show during any activity
  if (!active) return null;

  const getStageInfo = () => {
    switch (stage) {
      case 'reasoning':
        return {
          icon: Brain,
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500',
          title: '🧠 Deep Reasoning in Progress',
          subtitle: 'AI is analyzing and thinking through your request...',
          tokens: reasoningTokens,
          progress: Math.min((reasoningTokens / 500) * 100, 100)
        };
      case 'responding':
        return {
          icon: Zap,
          color: 'text-purple-400',
          bgColor: 'bg-purple-900/20',
          borderColor: 'border-purple-500',
          title: '✍️ Generating Response',
          subtitle: 'Crafting the final answer based on reasoning...',
          tokens: responseTokens,
          progress: Math.min((responseTokens / 1000) * 100, 100)
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500',
          title: '🔗 Connecting to DeepSeek',
          subtitle: 'Establishing connection with AI reasoning engine...',
          tokens: 0,
          progress: 25
        };
    }
  };

  const stageInfo = getStageInfo();
  const IconComponent = stageInfo.icon;

  return (
    <Card className={`${stageInfo.borderColor} ${stageInfo.bgColor} animate-pulse`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-3 ${stageInfo.color}`}>
          <div className="relative">
            <IconComponent className="h-6 w-6 animate-spin" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold">{stageInfo.title}</div>
            <div className="text-sm text-gray-300 font-normal">{stageInfo.subtitle}</div>
          </div>
          <Badge variant="secondary" className="animate-bounce">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Processing Progress</span>
            <span className={stageInfo.color}>{Math.round(stageInfo.progress)}%</span>
          </div>
          <Progress 
            value={stageInfo.progress} 
            className="h-2 bg-gray-700"
          />
        </div>

        {/* Token Counters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
            <Cpu className="h-4 w-4 text-blue-400" />
            <div>
              <div className="text-xs text-gray-400">Reasoning</div>
              <div className="text-lg font-mono text-blue-400">{reasoningTokens}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
            <MessageSquare className="h-4 w-4 text-purple-400" />
            <div>
              <div className="text-xs text-gray-400">Response</div>
              <div className="text-lg font-mono text-purple-400">{responseTokens}</div>
            </div>
          </div>
        </div>

        {/* Live Activity Indicator */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/30">
          <Activity className="h-4 w-4 text-green-400 animate-pulse" />
          <span className="text-sm text-green-400">Streaming Active</span>
          <div className="flex gap-1 ml-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
