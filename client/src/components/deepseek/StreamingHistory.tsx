import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// ScrollArea component removed - using regular div with overflow
import { 
  Clock, 
  User, 
  Bot, 
  Brain, 
  Copy, 
  Trash2,
  BookOpen,
  MessageSquare
} from 'lucide-react';

interface StreamingHistoryProps {
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
    reasoning?: string;
    timestamp: Date;
    tokenCount?: number;
  }>;
  onClearHistory: () => void;
  onCopyMessage: (content: string) => void;
}

export function StreamingHistory({
  conversation,
  onClearHistory,
  onCopyMessage
}: StreamingHistoryProps) {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Clock className="h-4 w-4" />
            Conversation History ({conversation.length})
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={onClearHistory}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto">
          <div className="space-y-3 p-4">
            {conversation.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversation history yet</p>
                <p className="text-xs mt-1">Start a conversation to see your chat history</p>
              </div>
            ) : (
              conversation.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-950/20 border-blue-800'
                      : 'bg-green-950/20 border-green-800'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Bot className="h-4 w-4 text-green-400" />
                      )}
                      <span className="text-xs font-medium text-gray-300 uppercase">
                        {message.role}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatTimestamp(message.timestamp)}
                      </Badge>
                      {message.tokenCount && (
                        <Badge variant="secondary" className="text-xs">
                          {message.tokenCount} tokens
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopyMessage(message.content)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Reasoning Section for Assistant */}
                  {message.role === 'assistant' && message.reasoning && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-2">
                        <Brain className="h-3 w-3 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">
                          Reasoning Process
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 bg-gray-900 rounded p-2 border border-gray-700">
                        {message.reasoning.length > 200 
                          ? `${message.reasoning.substring(0, 200)}...` 
                          : message.reasoning
                        }
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="text-sm text-gray-200 whitespace-pre-wrap">
                    {message.content.length > 300 
                      ? `${message.content.substring(0, 300)}...` 
                      : message.content
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StreamingHistory;