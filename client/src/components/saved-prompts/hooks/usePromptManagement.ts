
import { useState, useEffect } from "react";
import { SavedPrompt, supabasePromptService } from "@/services/db/supabasePromptService";
import { useToast } from "@/hooks/use-toast";

export const usePromptManagement = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<SavedPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      const allPrompts = await supabasePromptService.getAllPrompts();
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

  const handleDeletePrompt = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await supabasePromptService.deletePrompt(id);
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

  const handlePromptUse = async (prompt: SavedPrompt) => {
    try {
      if (prompt.id) {
        await supabasePromptService.incrementUsage(prompt.id);
      }
      navigator.clipboard.writeText(prompt.prompt);
      toast({
        title: "Prompt Ready",
        description: "Prompt copied to clipboard and usage tracked",
      });
      loadPrompts();
    } catch (error) {
      console.error("Failed to track usage:", error);
      navigator.clipboard.writeText(prompt.prompt);
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

  return {
    prompts,
    filteredPrompts,
    searchTerm,
    setSearchTerm,
    isLoading,
    loadPrompts,
    handleDeletePrompt,
    handlePromptUse
  };
};
