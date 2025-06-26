
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { ConversationHistory as ConversationHistoryType } from "@/services/deepseek/types";

interface ConversationHistoryProps {
  conversations: Map<string, ConversationHistoryType[]>;
  onContinueConversation: (conversationId: string) => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ 
  conversations, 
  onContinueConversation 
}) => {
  if (conversations.size === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Conversation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Array.from(conversations.entries()).map(([convId, history]) => (
            <div key={convId} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Conversation {convId.slice(-8)}</span>
                <Badge variant="outline">{history.length} messages</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Last message: {new Date(history[history.length - 1]?.timestamp || 0).toLocaleString()}
              </div>
              <Button
                onClick={() => onContinueConversation(convId)}
                size="sm"
                variant="outline"
                className="mt-2"
              >
                Continue Conversation
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationHistory;
