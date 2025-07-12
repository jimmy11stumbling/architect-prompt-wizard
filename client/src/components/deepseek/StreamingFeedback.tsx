
import React from 'react';
import { Brain, Zap, Activity, Clock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
          tokens: reasoningTokens
        };
      case 'responding':
        return {
          icon: Zap,
          color: 'text-purple-400',
          bgColor: 'bg-purple-900/20',
          borderColor: 'border-purple-500',
          title: '✍️ Generating Response',
          subtitle: 'Crafting the final answer based on reasoning...',
          tokens: responseTokens
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500',
          title: '🔗 Connecting to DeepSeek',
          subtitle: 'Establishing connection with AI reasoning engine...',
          tokens: 0
        };
    }
  };

  const stageInfo = getStageInfo();
  const IconComponent = stageInfo.icon;

  return (
    <Card className={`${stageInfo.borderColor} ${stageInfo.bgColor} border-2`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <IconComponent className={`h-8 w-8 ${stageInfo.color} animate-pulse`} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
            
            <div>
              <div className={`text-lg font-semibold ${stageInfo.color}`}>
                {stageInfo.title}
              </div>
              <div className="text-sm text-gray-300">
                {stageInfo.subtitle}
              </div>
              {stageInfo.tokens > 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  Tokens processed: {stageInfo.tokens}
                </div>
              )}
            </div>
          </div>

          {/* Animated dots */}
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 ${stageInfo.color.replace('text-', 'bg-')} rounded-full animate-bounce`}></div>
            <div className={`w-3 h-3 ${stageInfo.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`w-3 h-3 ${stageInfo.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${stageInfo.color.replace('text-', 'bg-')} transition-all duration-500 animate-pulse`}
              style={{ 
                width: stage === 'connecting' ? '20%' : stage === 'reasoning' ? '60%' : '90%'
              }}
            ></div>
          </div>
        </div>

        {/* Live activity indicator */}
        <div className="flex items-center justify-center mt-3 gap-2">
          <Activity className={`h-4 w-4 ${stageInfo.color} animate-spin`} />
          <span className="text-xs text-gray-400 font-mono">
            LIVE • DeepSeek AI Processing
          </span>
          <Eye className={`h-4 w-4 ${stageInfo.color} animate-pulse`} />
        </div>
      </CardContent>
    </Card>
  );
}
