
import React, { useEffect, useState } from "react";
import { SavedPrompt, promptService } from "@/services/api/promptService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptSearch, EmptyState } from "./saved-prompts";
import PromptLibrary from "./saved-prompts/PromptLibrary";
import PromptEditor from "./saved-prompts/PromptEditor";
import PromptCard from "./saved-prompts/PromptCard";

const SavedPrompts: React.FC = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPrompts, setFilteredPrompts] = useState<SavedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [activeTab, setActiveTab] = useState("library");
  const { toast } = useToast();

  // Load prompts from Supabase
  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      const allPrompts = await promptService.getAllPrompts();
      setPrompts(allPrompts);
      setFilteredPrompts(allPrompts);
    } catch (error) {
      console.error("Failed to load prompts:", error);
      toast({
        title: "Error",
        description: "Failed to load saved prompts. Please make sure you're signed in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        (prompt.tags || []).some(tag => tag.toLowerCase().includes(term)) ||
        prompt.description?.toLowerCase().includes(term)
    );
    setFilteredPrompts(filtered);
  }, [searchTerm, prompts]);

  const handleDeletePrompt = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await promptService.deletePrompt(id);
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

  const handlePromptSelect = (prompt: SavedPrompt) => {
    setSelectedPrompt(prompt);
    setActiveTab("editor");
  };

  const handlePromptUse = async (prompt: SavedPrompt) => {
    try {
      if (prompt.id) {
        await promptService.incrementUsage(prompt.id);
      }
      handleCopy(prompt.prompt);
      toast({
        title: "Prompt Ready",
        description: "Prompt copied to clipboard and usage tracked",
      });
      // Reload prompts to show updated usage count
      loadPrompts();
    } catch (error) {
      console.error("Failed to track usage:", error);
      handleCopy(prompt.prompt);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Prompt Library</TabsTrigger>
          <TabsTrigger value="manage">Manage Prompts</TabsTrigger>
          <TabsTrigger value="editor">Prompt Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <PromptLibrary 
            prompts={prompts}
            onPromptSelect={handlePromptSelect}
            onPromptUse={handlePromptUse}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-ipa-primary" />
                  <CardTitle>Manage Saved Prompts</CardTitle>
                </div>
                <CardDescription>{filteredPrompts.length} prompts stored in database</CardDescription>
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
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {filteredPrompts.map((prompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        onDelete={handleDeletePrompt}
                        onCopy={handleCopy}
                        onDownload={handleDownload}
                        onEdit={() => handlePromptSelect(prompt)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <PromptEditor 
            prompt={selectedPrompt}
            onSave={loadPrompts}
            onClose={() => {
              setSelectedPrompt(null);
              setActiveTab("library");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedPrompts;
