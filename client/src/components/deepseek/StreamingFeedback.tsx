import React from 'react';
import { Brain, Loader2, Zap, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StreamingFeedbackProps {
  active: boolean;
  stage: 'connecting' | 'reasoning' | 'responding' | 'complete';
  reasoningTokens?: number;
  responseTokens?: number;
}

export function StreamingFeedback({ 
  active, 
  stage, 
  reasoningTokens = 0, 
  responseTokens = 0 
}: StreamingFeedbackProps) {
  if (!active) return null;

  const getStageContent = () => {
    switch (stage) {
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Connecting to DeepSeek...',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          dots: true
        };
      case 'reasoning':
        return {
          icon: <Brain className="h-4 w-4 animate-pulse" />,
          text: `🤖 AI Reasoning (${reasoningTokens} tokens)`,
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          dots: true
        };
      case 'responding':
        return {
          icon: <Zap className="h-4 w-4 animate-pulse" />,
          text: `📝 Generating Response (${responseTokens} tokens)`,
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          dots: true
        };
      case 'complete':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Response Complete ✅',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dots: false
        };
      default:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Processing...',
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          dots: true
        };
    }
  };

  const { icon, text, color, dots } = getStageContent();

  return (
    <Card className={`border ${color} animate-pulse`}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {icon}
            <div className="absolute -inset-1 bg-current opacity-20 rounded-full animate-ping"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {text}
              </span>
              {dots && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" 
                       style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" 
                       style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
            {active && (
              <Badge variant="outline" className="mt-1 text-xs">
                Live streaming ▌
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StreamingFeedback;