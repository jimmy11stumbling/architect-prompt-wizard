
import React, { useEffect, useState } from "react";
import { SavedPrompt, getAllPrompts, deletePrompt } from "@/services/db/promptDatabaseService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Clock, Copy, Download, Database } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-ipa-muted">Loading saved prompts...</div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Database className="h-10 w-10 text-ipa-muted mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No saved prompts found</h3>
            <p className="text-sm text-muted-foreground">
              {prompts.length === 0
                ? "Generate your first prompt to automatically save it here"
                : "No prompts match your search criteria"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="border-ipa-border">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="text-ipa-muted hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(prompt.prompt)}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(prompt.prompt)}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedPrompts;
