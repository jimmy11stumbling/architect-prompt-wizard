
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "lucide-react";
import { SavedPrompt } from "@/services/api/promptService";
import { PromptSearch, EmptyState } from "../";
import PromptCard from "../PromptCard";

interface PromptManagementProps {
  prompts: SavedPrompt[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading: boolean;
  onDelete: (id: string | undefined) => void;
  onCopy: (prompt: string) => void;
  onDownload: (prompt: string, filename?: string) => void;
  onEdit: (prompt: SavedPrompt) => void;
}

const PromptManagement: React.FC<PromptManagementProps> = ({
  prompts,
  searchTerm,
  onSearchChange,
  isLoading,
  onDelete,
  onCopy,
  onDownload,
  onEdit
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-ipa-primary" />
            <CardTitle>Manage Saved Prompts</CardTitle>
          </div>
          <CardDescription>{prompts.length} prompts stored in database</CardDescription>
        </div>
        <PromptSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-ipa-muted">Loading saved prompts...</div>
          </div>
        ) : prompts.length === 0 ? (
          <EmptyState hasPrompts={false} isFiltered={searchTerm.trim() !== ""} />
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onDelete={onDelete}
                  onCopy={onCopy}
                  onDownload={onDownload}
                  onEdit={() => onEdit(prompt)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptManagement;
