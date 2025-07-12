import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Zap, Activity, Cpu, MessageSquare } from 'lucide-react';

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
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          title: '🔗 Connecting to DeepSeek',
          description: 'Establishing secure connection to AI reasoning engine...',
          color: 'bg-gradient-to-r from-blue-600 to-cyan-600',
          progress: 25
        };
      case 'reasoning':
        return {
          icon: <Brain className="h-5 w-5 animate-pulse" />,
          title: '🤖 Deep Chain-of-Thought Reasoning',
          description: `AI is thinking step by step... (${reasoningTokens} reasoning tokens generated)`,
          color: 'bg-gradient-to-r from-purple-600 to-pink-600',
          progress: Math.min(65 + (reasoningTokens / 100), 85)
        };
      case 'responding':
        return {
          icon: <Zap className="h-5 w-5 animate-bounce" />,
          title: '📝 Generating Final Response',
          description: `Crafting comprehensive answer... (${responseTokens} response tokens)`,
          color: 'bg-gradient-to-r from-green-600 to-emerald-600',
          progress: Math.min(85 + (responseTokens / 50), 95)
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-lg p-6 mb-4 shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${stageInfo.color} shadow-lg`}>
          {stageInfo.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-white text-lg">{stageInfo.title}</span>
            <Badge variant="outline" className="text-xs bg-green-500/20 border-green-500 text-green-400">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
          </div>
          <p className="text-sm text-gray-300">{stageInfo.description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Processing Progress</span>
          <span>{Math.round(stageInfo.progress)}%</span>
        </div>
        <Progress 
          value={stageInfo.progress} 
          className="h-3 bg-gray-700"
        />
      </div>

      {/* Token counters */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1 text-purple-400">
          <Cpu className="h-3 w-3" />
          <span>Reasoning: {reasoningTokens}</span>
        </div>
        <div className="flex items-center gap-1 text-green-400">
          <MessageSquare className="h-3 w-3" />
          <span>Response: {responseTokens}</span>
        </div>
      </div>
    </div>
  );
}