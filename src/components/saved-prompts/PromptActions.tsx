
import React from "react";
import { SavedPrompt } from "@/services/db/promptDatabaseService";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Download } from "lucide-react";

interface PromptActionsProps {
  prompt: SavedPrompt;
  onDelete: (id: number | undefined) => void;
  onCopy: (prompt: string) => void;
  onDownload: (prompt: string) => void;
}

const PromptActions: React.FC<PromptActionsProps> = ({ prompt, onDelete, onCopy, onDownload }) => {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(prompt.id)}
        className="text-ipa-muted hover:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(prompt.prompt)}
        >
          <Copy className="h-4 w-4 mr-1" /> Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(prompt.prompt)}
        >
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
    </>
  );
};

export default PromptActions;
