
import React, { useEffect, useState } from "react";
import { SavedPrompt, getAllPrompts, deletePrompt } from "@/services/db/promptDatabaseService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PromptCard, PromptSearch, EmptyState } from "./saved-prompts";

const SavedPrompts: React.FC = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPrompts, setFilteredPrompts] = useState<SavedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load prompts from the database
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setIsLoading(true);
        const allPrompts = await getAllPrompts();
        setPrompts(allPrompts);
        setFilteredPrompts(allPrompts);
      } catch (error) {
        console.error("Failed to load prompts:", error);
        toast({
          title: "Error",
          description: "Failed to load saved prompts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, [toast]);

  // Filter prompts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPrompts(prompts);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = prompts.filter(
      prompt =>
        prompt.prompt.toLowerCase().includes(term) ||
        prompt.projectName.toLowerCase().includes(term) ||
        (prompt.tags || []).some(tag => tag.toLowerCase().includes(term))
    );
    setFilteredPrompts(filtered);
  }, [searchTerm, prompts]);

  const handleDeletePrompt = async (id: number | undefined) => {
    if (id === undefined) return;
    
    try {
      await deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      toast({
        title: "Prompt Deleted",
        description: "The saved prompt has been deleted",
      });
    } catch (error) {
      console.error("Failed to delete prompt:", error);
      toast({
        title: "Error",
        description: "Failed to delete the prompt",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard",
    });
  };

  const handleDownload = (prompt: string, filename = "cursor-prompt.md") => {
    const blob = new Blob([prompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "The prompt has been downloaded as a markdown file",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-ipa-primary" />
            <CardTitle>Saved Prompts</CardTitle>
          </div>
          <CardDescription>{filteredPrompts.length} prompts stored locally</CardDescription>
        </div>
        <PromptSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-ipa-muted">Loading saved prompts...</div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <EmptyState hasPrompts={prompts.length > 0} isFiltered={searchTerm.trim() !== ""} />
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onDelete={handleDeletePrompt}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedPrompts;
