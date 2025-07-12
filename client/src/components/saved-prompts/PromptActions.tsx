
import React from "react";
import { SavedPrompt } from "@/services/api/promptService";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Copy, Download, Edit, MoreHorizontal, Play, Trash2 } from "lucide-react";

interface PromptActionsProps {
  prompt: SavedPrompt;
  onDelete: (id: string | undefined) => void;
  onCopy: (prompt: string) => void;
  onDownload: (prompt: string) => void;
  onEdit?: (prompt: SavedPrompt) => void;
  onUse?: (prompt: SavedPrompt) => void;
}

const PromptActions: React.FC<PromptActionsProps> = ({
  prompt,
  onDelete,
  onCopy,
  onDownload,
  onEdit,
  onUse
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUse?.(prompt)}
        className="flex items-center gap-1"
      >
        <Play className="h-3 w-3" />
        Use
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onCopy(prompt.prompt)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Prompt
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDownload(prompt.prompt)}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </DropdownMenuItem>
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(prompt)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(prompt.id)} 
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PromptActions;
