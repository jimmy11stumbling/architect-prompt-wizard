
import React from "react";
import { SavedPrompt } from "@/services/db/promptDatabaseService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";
import PromptActions from "./PromptActions";

interface PromptCardProps {
  prompt: SavedPrompt;
  onDelete: (id: number | undefined) => void;
  onCopy: (prompt: string) => void;
  onDownload: (prompt: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onDelete, onCopy, onDownload }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="border-ipa-border">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{prompt.projectName}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(prompt.timestamp)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="max-h-24 overflow-hidden text-ellipsis text-sm">
          {prompt.prompt?.substring(0, 150)}
          {(prompt.prompt?.length || 0) > 150 ? "..." : ""}
        </div>
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prompt.tags.slice(0, 5).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{prompt.tags.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="pt-2 flex justify-between">
        <PromptActions
          prompt={prompt}
          onDelete={onDelete}
          onCopy={onCopy}
          onDownload={onDownload}
        />
      </CardFooter>
    </Card>
  );
};

export default PromptCard;
